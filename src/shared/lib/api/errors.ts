export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN",
  MISSING_REFRESH_TOKEN: "MISSING_REFRESH_TOKEN",
} as const;

// Refresh-token errors that are permanent means the cookie is gone or invalid.
// Any other failure (network, 5xx) is transient and should not trigger signOut.
export const HARD_AUTH_FAILURE_CODES: ReadonlySet<string> = new Set([API_ERROR_CODES.INVALID_REFRESH_TOKEN, API_ERROR_CODES.MISSING_REFRESH_TOKEN]);
