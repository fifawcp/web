import { getSession } from "next-auth/react";
import { ApiResponse, ApiErrorType, getErrorType } from "./types";
import { logger } from "../logger";

// Re-export types for convenience
export type { ApiResponse } from "./types";
export { ApiErrorType } from "./types";

interface FetchWithAuthOptions extends RequestInit {
  skipRefresh?: boolean;
}

export async function fetchWithAuth(url: string, options: FetchWithAuthOptions = {}): Promise<Response> {
  const { skipRefresh = false, ...fetchOptions } = options;

  // Get session from NextAuth (only works on client side)
  let session = null;
  if (typeof window !== "undefined") {
    session = await getSession();
  }

  const headers = new Headers(fetchOptions.headers);

  if (session?.access_token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: "include",
  };

  const response = await fetch(url, requestOptions);

  // NextAuth handles token refresh automatically
  if (response.status === 401 && !skipRefresh) {
    // Session expired, redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
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

    if (options.body !== undefined) {
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

// Special request function that bypasses fetchWithAuth (uses plain fetch)
async function requestWithoutAuth<T>(endpoint: string, options: RequestOptions & { method: string; body?: unknown } = { method: "GET" }): Promise<ApiResponse<T>> {
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

    if (options.body !== undefined) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    // Handle 204 No Content
    if (response.status === 204) {
      return {
        success: true,
        data: undefined as T,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || data.message || "Something went wrong";
      const errorType = getErrorType(response.status, errorMessage);

      return {
        success: false,
        error: errorMessage,
        errorType,
        statusCode: response.status,
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

  // Special method for refresh token that bypasses auth middleware
  refreshToken: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    requestWithoutAuth<T>(endpoint, {
      ...options,
      method: "POST",
      body,
    }),
};
