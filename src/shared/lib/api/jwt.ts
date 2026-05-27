// Decodes the `exp` claim from a JWT and returns it as epoch milliseconds.
// Returns null when the token is malformed - callers treat this as "expired" and refresh
export function decodeJwtExpMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json?.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

// Returns true when the token expires within `skewMs` (default 60 s) from now.
// A null exp is treated conservatively as stale so we always try to refresh
export function isTokenStale(token: string, skewMs = 60_000): boolean {
  const expMs = decodeJwtExpMs(token);
  return expMs == null || Date.now() >= expMs - skewMs;
}
