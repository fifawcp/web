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

// Extracts the refresh token from the upstream Set-Cookie header and re-sets it
// with path="/" so it travels on every browser request, not only /api/auth ones.
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
}
