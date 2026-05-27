import { NextRequest, NextResponse } from "next/server";

export const REFRESH_COOKIE = "refresh_token";
export const UPSTREAM = process.env.BACKEND_API_URL!;

export function forwardedClientHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const ua = req.headers.get("user-agent");
  if (ua) headers["User-Agent"] = ua;
  // Prefer an already-set X-Forwarded-For from a load balancer; otherwise use the
  // direct client IP from the Next.js connection.
  const xff = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  if (xff) headers["X-Forwarded-For"] = xff;
  return headers;
}

// Re-sets the refresh-token cookie at path="/" so it is visible on every route.
// Also clears the backend's natural Path=/api/auth copy — the Google OAuth callback
// sets it there directly (browser ← backend redirect, bypasses Next.js), and only
// this BFF rewrite can clean it up proactively on the next token operation
export function rewriteRefreshCookie(header: string | null, res: NextResponse): void {
  if (!header) return;
  const valueMatch = new RegExp(`^${REFRESH_COOKIE}=([^;]+)`).exec(header.trim());
  if (!valueMatch?.[1]) return;
  const expiresMatch = /Expires=([^;]+)/i.exec(header);
  res.cookies.set(REFRESH_COOKIE, valueMatch[1], {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(expiresMatch?.[1] && { expires: new Date(expiresMatch[1]) }),
  });

  // Clear the Path=/api/auth copy. Use headers.append — cookies.set is keyed by
  // name only, so a second call for the same cookie name at a different path
  // would silently clobber the set above
  const secureSuffix = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.headers.append("Set-Cookie", `${REFRESH_COOKIE}=; Path=/api/auth; Max-Age=0; HttpOnly; SameSite=Lax${secureSuffix}`);
}
