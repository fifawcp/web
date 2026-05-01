import { logger } from "../logger";

import { API_ERROR_CODES } from "./errors";
import { ApiError, ApiResponse } from "./types";

export type RefreshedAccessToken = {
  access_token: string;
  expires_at: string;
};

// Module-level promise that deduplicates concurrent refresh calls within the same tab.
// Cross-tab deduplication is handled by the Web Lock below
let inFlight: Promise<ApiResponse<RefreshedAccessToken>> | null = null;

// Calls the Next.js route handler, which proxies to the API and re-sets the
// refresh-token cookie with path="/" so the middleware can read it on all routes
async function postRefresh(): Promise<ApiResponse<RefreshedAccessToken>> {
  try {
    const response = await fetch("/api/auth/token/refresh", { method: "POST" });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = body.error as ApiError | undefined;
      return {
        success: false,
        error: {
          code: err?.code ?? API_ERROR_CODES.NETWORK_ERROR,
          message: err?.message ?? "Refresh failed",
          requestId: err?.requestId ?? "",
          fields: err?.fields,
        },
      };
    }

    return { success: true, data: body.data };
  } catch (error) {
    logger.error("Refresh token request error:", error);

    return {
      success: false,
      error: { code: API_ERROR_CODES.NETWORK_ERROR, message: "Network error occurred", requestId: "", fields: undefined },
    };
  }
}

// Refreshes the backend access token with two layers of deduplication:
//   1. inFlight promise  -> collapses concurrent callers within the same tab
//   2. Web Lock          -> serialises calls across all open tabs so only one
//                          tab hits the network; the rest wait for the winner
// The TS types for LockManager.request` infers Promise<Promise<T>> when the
// callback returns a Promise; the runtime always unwraps it, so the cast is safe
export function refreshBackendAccessToken(): Promise<ApiResponse<RefreshedAccessToken>> {
  if (inFlight) return inFlight;

  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;

  const base: Promise<ApiResponse<RefreshedAccessToken>> = locks
    ? (locks.request("auth-refresh", { mode: "exclusive" }, postRefresh) as unknown as Promise<ApiResponse<RefreshedAccessToken>>)
    : postRefresh();

  inFlight = base.finally(() => {
    inFlight = null;
  });

  return inFlight;
}
