import { getSession, signOut } from "next-auth/react";
import { ApiError, ApiResponse } from "./types";
import { logger } from "../logger";

const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

type AuthData = {
  access_token: string;
  expires_at: string;
};

async function refreshToken(): Promise<AuthData | null> {
  try {
    const response = await fetch(`${BASE_API_URL}/api/auth/token/refresh`, {
      method: "POST",
      credentials: "include", // Sends HTTP-only cookie with the refresh token
    });

    if (!response.ok) return null;

    const body = await response.json();
    return body.data;
  } catch {
    return null;
  }
}

export async function fetchWithAuth(url: string, options: FetchWithAuthOptions): Promise<Response> {
  const { update, ...fetchOptions } = options;

  const isBrowser = typeof window !== "undefined";
  const session = isBrowser ? await getSession() : null;
  const accessToken = session?.access_token ?? null;

  const headers = new Headers(fetchOptions.headers);
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...fetchOptions, headers, credentials: "include" });

  if (response.status == 401) {
    const authData = await refreshToken();
    if (!authData) {
      // If there is no successfull refresh, sign out the user and redirect to the login page
      // TODO: call logout endpoint too (analyze if needed, as this one is probably expired)
      if (isBrowser) void signOut({ callbackUrl: "/login" });

      return response;
    }

    // Update the session with the new auth data
    if (update) await update(authData);

    // Retry the request with the new auth data
    const retryHeaders = new Headers(fetchOptions.headers);
    retryHeaders.set("Authorization", `Bearer ${authData.access_token}`);

    return fetch(url, {...fetchOptions, headers: retryHeaders, credentials: "include" });
  }

  return response;
}

type RequestOptions = Omit<RequestInit, "method" | "body"> & {
  authenticated?: boolean;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: unknown;
  update?: (data: AuthData) => Promise<unknown>;
};

type FetchWithAuthOptions = RequestInit & { update?: (data: AuthData) => Promise<unknown> };

async function request<T>(
  endpoint: string,
  options: RequestOptions = { method: "GET" }
): Promise<ApiResponse<T>> {
  try {
    const url = `${BASE_API_URL}${endpoint}`;
    const fetchOptions: FetchWithAuthOptions = {
      method: options.method,
      headers: { "Content-Type": "application/json", ...options.headers },
      credentials: "include",
      update: options.update,
    };

    if (options.body != null) fetchOptions.body = JSON.stringify(options.body);

    const response = options.authenticated
      ? await fetchWithAuth(url, fetchOptions)
      : await fetch(url, fetchOptions);

    // No-content responses
    if (response.status === 204) {
      return { success: true, data: undefined };
    }

    const body = await response.json();

    if (!response.ok) {      
      const { code, message, requestId, fields } = body.error as ApiError;
      return {
        success: false,
        error: { code, message, requestId, fields },
      };
    }

    return { success: true, data: body.data };
  } catch (error) {
    logger.error("API request error:", error);

    // TODO: should we consideer all catch errors as network errors?
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Network error occurred",
        requestId: "",
        fields: undefined,
      },
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
