import { getSession, signOut } from "next-auth/react";
import { ApiResponse, ApiErrorType, getErrorType } from "./types";
import { logger } from "../logger";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

/**
 * Attempt silent token refresh using HTTP-only refresh cookie
 * Returns new access token if successful, null otherwise
 */
async function silentRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/token/refresh`, {
      method: "POST",
      credentials: "include", // Important: sends HTTP-only refresh cookie
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.access_token ?? data.data?.access_token ?? null;
  } catch (error) {
    logger.error("Silent refresh failed:", error);
    return null;
  }
}

interface FetchWithAuthOptions extends RequestInit {
  skipRefresh?: boolean;
}

export async function fetchWithAuth(url: string, options: FetchWithAuthOptions = {}): Promise<Response> {
  const { skipRefresh = false, ...fetchOptions } = options;

  // Get session from NextAuth (only works on client side)
  let accessToken: string | null = null;
  if (typeof window !== "undefined") {
    const session = await getSession();
    accessToken = session?.access_token ?? null;
  }

  const headers = new Headers(fetchOptions.headers);

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: "include",
  };

  const response = await fetch(url, requestOptions);

  // Attempt silent refresh on 401 if not skipped
  if (response.status === 401 && !skipRefresh) {
    const newToken = await silentRefresh();

    if (!newToken) {
      // Refresh failed, sign out user
      if (typeof window !== "undefined") {
        signOut({ callbackUrl: "/login" });
      }
      return response;
    }

    // Retry request with new token
    const retryHeaders = new Headers(fetchOptions.headers);
    retryHeaders.set("Authorization", `Bearer ${newToken}`);

    return fetch(url, {
      ...fetchOptions,
      headers: retryHeaders,
      credentials: "include",
    });
  }

  return response;
}

type RequestOptions = Omit<RequestInit, "method" | "body"> & {
  skipRefresh?: boolean;
};

async function request<T>(endpoint: string, options: RequestOptions & { method: string; body?: unknown } = { method: "GET" }): Promise<ApiResponse<T>> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${endpoint}`;

    const fetchOptions: RequestInit = {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    };

    if (options.body != null) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    // For skipRefresh requests (like OTP), use plain fetch
    // For authenticated requests, use fetchWithAuth
    const response = options.skipRefresh ? await fetch(url, fetchOptions) : await fetchWithAuth(url, { ...fetchOptions, skipRefresh: false });

    // Handle 204 No Content
    if (response.status === 204) {
      return {
        success: true,
        data: undefined as T,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || "Something went wrong";
      const errorType = getErrorType(response.status, errorMessage);

      return {
        success: false,
        error: errorMessage,
        errorType,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    logger.error("API Request Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
      errorType: ApiErrorType.NETWORK_ERROR,
    };
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: "DELETE" }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body,
    }),
};
