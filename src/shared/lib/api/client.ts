import { getSession, signOut } from "next-auth/react";

import { logger } from "../logger";

import { HARD_AUTH_FAILURE_CODES } from "./errors";
import { isTokenStale } from "./jwt";
import { refreshBackendAccessToken, RefreshedAccessToken } from "./refresh";
import { ApiError, ApiResponse } from "./types";

type SessionUpdater = (data: RefreshedAccessToken) => Promise<unknown>;

type RequestOptions = Omit<RequestInit, "method" | "body"> & {
  authenticated?: boolean;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  update?: SessionUpdater;
};

type FetchOptions = RequestInit & { update?: SessionUpdater };

// Performs an authenticated fetch with two layers of token freshness:
//   1. Lazy pre-refresh -> if the stored token is near expiry, refresh before sending
//   2. Reactive retry -> if the API returns 401 anyway (clock skew, race), refresh once and retry
// Transient failures (network, 5xx) are bubbled up without forcing signOut
export async function fetchWithAuth(url: string, options: FetchOptions): Promise<Response> {
  const { update, ...fetchOptions } = options;

  let accessToken = await getAccessToken();

  // If the stored token is near expiry, refresh before sending
  if (accessToken && isTokenStale(accessToken)) {
    accessToken = (await doRefresh(update)) ?? accessToken;
  }

  const response = await fetch(url, { ...fetchOptions, headers: withBearer(fetchOptions.headers, accessToken) });
  if (response.status !== 401) return response;

  // Reactive refresh + single retry as a safety net for clock-skew or race conditions
  const fresh = await doRefresh(update);
  if (!fresh) return response;

  return fetch(url, { ...fetchOptions, headers: withBearer(fetchOptions.headers, fresh) });
}

async function getAccessToken(): Promise<string | null> {
  const isBrowser = typeof window !== "undefined";
  const session = isBrowser ? await getSession() : null;

  return session?.access_token ?? null;
}

// Attempts a token refresh. Signs the user out only on hard auth errors (invalid / missing refresh token cookie).
// Network blips and server errors leave the session intact for the next attempt.
async function doRefresh(update?: SessionUpdater): Promise<string | null> {
  const res = await refreshBackendAccessToken();

  if (res.success && res.data) {
    if (update) await update(res.data);
    return res.data.access_token;
  }

  // If the refresh failed due to a hard auth error, sign the user out
  if (res.error && HARD_AUTH_FAILURE_CODES.has(res.error.code)) {
    if (typeof window !== "undefined") void signOut({ callbackUrl: "/login" });
  }

  // If the refresh failed due to a transient error, return null so the caller can retry
  return null;
}

function withBearer(base: HeadersInit | undefined, token: string | null): Headers {
  const headers = new Headers(base);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function request<T>(endpoint: string, options: RequestOptions = { method: "GET" }): Promise<ApiResponse<T>> {
  try {
    const fetchOptions: FetchOptions = {
      method: options.method,
      headers: { "Content-Type": "application/json", ...options.headers },
      update: options.update,
      signal: options.signal,
    };
    if (options.body != null) fetchOptions.body = JSON.stringify(options.body);

    // Relative URL -> Next proxies "/api/*" to the backend, making cookies same-origin
    const response = options.authenticated ? await fetchWithAuth(endpoint, fetchOptions) : await fetch(endpoint, fetchOptions);

    if (response.status === 204) return { success: true, data: undefined };

    const body = await response.json();
    if (!response.ok) {
      const { code, message, requestId, fields } = body.error as ApiError;
      return { success: false, error: { code, message, requestId, fields } };
    }

    return { success: true, data: body.data, pagination: body.pagination, status: response.status };
  } catch (error) {
    // A request aborted via its signal (e.g. React Query cancelling a superseded
    // or unmounted query) is not a failure — rethrow so the caller treats it as
    // a cancellation instead of logging noise / surfacing a NETWORK_ERROR.
    if (options.signal?.aborted) throw error;
    logger.error("API request error:", error);
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Network error occurred", requestId: "", fields: undefined },
    };
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "POST", body }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "PUT", body }),
  delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "DELETE" }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "PATCH", body }),
};
