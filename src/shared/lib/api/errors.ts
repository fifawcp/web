import type { ApiErrorField } from "./types";

export const API_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  // Caller lacks permission for the action (e.g. role revoked while a stale view was open).
  FORBIDDEN: "FORBIDDEN",
  // Codes the backend actually emits on the refresh endpoint (see api handlers/errors.go).
  REFRESH_TOKEN_INVALID_OR_EXPIRED: "REFRESH_TOKEN_INVALID_OR_EXPIRED",
  REFRESH_TOKEN_NOT_FOUND: "REFRESH_TOKEN_NOT_FOUND",
  MISSING_REFRESH_TOKEN: "MISSING_REFRESH_TOKEN",
} as const;

// Permanent refresh failures: the cookie is gone, or the token is genuinely
// invalid/expired (beyond the backend's rotation grace window). These force a
// sign-out. Any other failure (network, 5xx, a transient/uncoded 401) is treated
// as recoverable and must NOT trigger signOut.
export const HARD_AUTH_FAILURE_CODES: ReadonlySet<string> = new Set([
  API_ERROR_CODES.REFRESH_TOKEN_INVALID_OR_EXPIRED,
  API_ERROR_CODES.REFRESH_TOKEN_NOT_FOUND,
  API_ERROR_CODES.MISSING_REFRESH_TOKEN,
]);

export class ApiClientError extends Error {
  readonly code: string;
  readonly fields?: Record<string, ApiErrorField>;
  constructor(code: string, message: string, fields?: Record<string, ApiErrorField>) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.fields = fields;
  }
}

type Translator = { (key: string): string; has?: (key: string) => boolean };

export function translateApiError(error: unknown, tApiErrors: Translator): string {
  const code = error instanceof ApiClientError ? error.code : "UNKNOWN_ERROR";
  if (typeof tApiErrors.has === "function" && tApiErrors.has(code)) return tApiErrors(code);
  return tApiErrors("UNKNOWN_ERROR");
}
