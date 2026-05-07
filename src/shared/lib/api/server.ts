import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { env } from "@/lib/env";

import { logger } from "../logger";

import { ApiError, ApiResponse } from "./types";

type RequestOptions = Omit<RequestInit, "method" | "body"> & {
  authenticated?: boolean;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
};

// Server-to-server API client. Reads the access token from the NextAuth session
// (which middleware has already refreshed if stale) and forwards it as a Bearer token.
// Middleware is responsible for keeping the token fresh, so this client does not
// attempt any refresh, it trusts the JWT it receives
async function request<T>(endpoint: string, options: RequestOptions = { method: "GET" }): Promise<ApiResponse<T>> {
  const authenticated = options.authenticated !== false;

  try {
    const url = `${env.BACKEND_API_URL}${endpoint}`;
    const headers = new Headers(options.headers as HeadersInit | undefined);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

    if (authenticated) {
      const session = await getSession();
      const accessToken = session?.access_token;

      if (!accessToken) redirect("/login");

      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const init: RequestInit = {
      method: options.method,
      headers,
      cache: options.cache,
      next: options.next,
      signal: options.signal,
    };
    if (options.body != null) init.body = JSON.stringify(options.body);

    const response = await fetch(url, init);

    if (response.status === 204) return { success: true, data: undefined };

    const body = await response.json();

    // 401 here means either the token was revoked server-side or there is a clock
    // skew past what middleware's skew window covered. Either way, re-authentication
    // is required — redirect throws so this branch never returns.
    if (response.status === 401) redirect("/login");

    if (!response.ok) {
      const { code, message, requestId, fields } = body.error as ApiError;
      return { success: false, error: { code, message, requestId, fields } };
    }

    return { success: true, data: body.data, pagination: body.pagination };
  } catch (error) {
    logger.error("Server API request error:", error);
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Network error occurred", requestId: "", fields: undefined },
    };
  }
}

export const serverApi = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) => request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) => request<T>(endpoint, { ...options, method: "POST", body }),
  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) => request<T>(endpoint, { ...options, method: "PUT", body }),
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) => request<T>(endpoint, { ...options, method: "DELETE" }),
  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) => request<T>(endpoint, { ...options, method: "PATCH", body }),
};
