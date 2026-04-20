import { clientEnv } from "@/lib/env";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { refreshToken as refreshAuthToken } from "@/features/auth/api/client";
import { ApiResponse, ApiErrorType, getErrorType } from "./types";
import { logger } from "../logger";

const BASE_API_URL = clientEnv.NEXT_PUBLIC_BACKEND_API_URL;

// Re-export types for convenience
export type { ApiResponse } from "./types";
export { ApiErrorType } from "./types";

interface FetchWithAuthOptions extends RequestInit {
  skipRefresh?: boolean;
}

export async function fetchWithAuth(url: string, options: FetchWithAuthOptions = {}): Promise<Response> {
  const { skipRefresh = false, ...fetchOptions } = options;
  const { accessToken, expiresAt, setAuth, clearAuth, user, isTokenExpired } = useAuthStore.getState();
  // Check if token is expired before making request
  // If expired, it means refresh token is also expired -> logout
  if (accessToken && expiresAt && isTokenExpired()) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new Error("Session expired. Please log in again.");
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

  let response = await fetch(url, requestOptions);

  if (response.status === 401 && !skipRefresh) {
    const refreshResponse = await refreshAuthToken();

    if (refreshResponse.success && refreshResponse.data && user) {
      const { access_token, expires_at } = refreshResponse.data.data;
      setAuth(access_token, expires_at, user);

      headers.set("Authorization", `Bearer ${access_token}`);
      const retryOptions: RequestInit = {
        ...fetchOptions,
        headers,
        credentials: "include",
      };

      response = await fetch(url, retryOptions);
    } else {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }

  return response;
}

type RequestOptions = Omit<RequestInit, "method" | "body"> & {
  skipRefresh?: boolean;
};

async function request<T>(endpoint: string, options: RequestOptions & { method: string; body?: unknown } = { method: "GET" }): Promise<ApiResponse<T>> {
  try {
    const url = endpoint.startsWith("http") ? endpoint : `${BASE_API_URL}${endpoint}`;

    const fetchOptions: FetchWithAuthOptions = {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      skipRefresh: options.skipRefresh ?? false,
    };

    if (options.body !== undefined) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetchWithAuth(url, fetchOptions);

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
    const url = endpoint.startsWith("http") ? endpoint : `${BASE_API_URL}${endpoint}`;

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
