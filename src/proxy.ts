import { NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";
import { encode } from "next-auth/jwt";
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";

import { env } from "@/lib/env";
import { HARD_AUTH_FAILURE_CODES } from "@/shared/lib/api/errors";
import { isTokenStale } from "@/shared/lib/api/jwt";

// Authenticated users are redirected away from these routes
const GUEST_ONLY_ROUTES = new Set(["/login", "/register", "/callback"]);

// Accessible to everyone - no redirect in either direction
const PUBLIC_ROUTES = new Set(["/"]);

// Mirror next-auth's session cookie name convention
const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token";

const REFRESH_COOKIE = "refresh_token";
const SECRET = env.NEXTAUTH_SECRET;
const SESSION_MAX_AGE = env.NEXTAUTH_SESSION_MAX_AGE;

export default withAuth(
  // Runs after `authorized` confirms a session exists.
  async function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    const accessToken = token?.access_token as string | undefined;

    // Only redirect authenticated users away from guest pages when their token is
    // actually fresh. A stale token means the session may need re-authentication
    if (accessToken && !isTokenStale(accessToken) && GUEST_ONLY_ROUTES.has(pathname)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // For non-guest routes, proactively refresh the access token when it is near
    // expiry so the RSC always renders with a fresh token, no client recovery needed.
    if (!GUEST_ONLY_ROUTES.has(pathname) && accessToken && isTokenStale(accessToken)) {
      const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

      // No refresh token on the Next domain - session is unrecoverable. Clear the
      // NextAuth cookie so the login page doesn't bounce the user back to /.
      if (!refreshToken) return expiredSessionRedirect(req);

      const refreshed = await refreshUpstream(refreshToken);

      if (refreshed === "hard-failure") return expiredSessionRedirect(req);

      // On transient failure, let the request through — the RSC will hit a 401 and
      // redirect to /login from there. Better than an incorrect forced sign-out.
      if (refreshed) {
        return applyRefreshedToken(req, token!, refreshed);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Returns true when the request should proceed without a forced /login redirect.
      // - Guest-only: always allowed (login, register, callback)
      // - Public: always allowed — accessible to both auth and guest users (e.g. "/")
      // - Protected: only when a valid session with an access token exists
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (GUEST_ONLY_ROUTES.has(pathname) || PUBLIC_ROUTES.has(pathname)) return true;
        return !!token?.access_token;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/boards/:path*", "/login", "/register", "/callback"],
};

type RefreshSuccess = { accessToken: string; expiresAt: string; refreshToken: string; expires?: Date };

async function refreshUpstream(refreshToken: string): Promise<RefreshSuccess | "hard-failure" | null> {
  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/auth/token/refresh`, {
      method: "POST",
      headers: { Cookie: `${REFRESH_COOKIE}=${refreshToken}` },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const code = (body?.error?.code as string) ?? "";
      // Treat any 401 or known hard-auth code as permanent failure.
      return HARD_AUTH_FAILURE_CODES.has(code) || response.status === 401 ? "hard-failure" : null;
    }

    const body = await response.json().catch(() => null);
    const data = body?.data as { access_token: string; expires_at: string } | undefined;
    if (!data?.access_token) return null;

    const newRefreshToken = parseRefreshCookie(response.headers.get("set-cookie"));
    if (!newRefreshToken) return null;

    return { accessToken: data.access_token, expiresAt: data.expires_at, ...newRefreshToken };
  } catch {
    return null;
  }
}

// Builds a response that updates the NextAuth JWT and refresh-token cookie so both
// the current RSC render and all subsequent requests see the fresh tokens.
async function applyRefreshedToken(req: NextRequestWithAuth, token: JWT, refreshed: RefreshSuccess): Promise<NextResponse> {
  const updatedJwt = await encode({
    token: { ...token, access_token: refreshed.accessToken, expires_at: refreshed.expiresAt },
    secret: SECRET,
    maxAge: SESSION_MAX_AGE,
  });

  // Patch the request cookie so getServerSession() reads the fresh token in THIS render.
  const patchedCookies = req.cookies
    .getAll()
    .map(({ name, value }) => (name === SESSION_COOKIE ? `${name}=${updatedJwt}` : `${name}=${value}`))
    .join("; ");

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("cookie", patchedCookies);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Persist the new session cookie for subsequent requests.
  response.cookies.set(SESSION_COOKIE, updatedJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Forward the rotated refresh token from the API
  // path="/" is intentional, the middleware reads this cookie on every protected-route
  // navigation (e.g. "/", "/boards"), so it must be visible on all paths, not just "/api/auth".
  response.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(refreshed.expires && { expires: refreshed.expires }),
  });

  return response;
}

// Redirects to /login and clears the NextAuth session cookie so the login page
// doesn't treat the user as still authenticated and bounce them back to "/"
function expiredSessionRedirect(req: NextRequestWithAuth): NextResponse {
  const response = NextResponse.redirect(new URL("/login", req.url));
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}

// Parses the refresh token from the Set-Cookie header and returns it along with the expiration date.
function parseRefreshCookie(header: string | null): { refreshToken: string; expires?: Date } | null {
  if (!header) return null;

  const valueMatch = new RegExp(`^${REFRESH_COOKIE}=([^;]+)`).exec(header.trim());
  if (!valueMatch?.[1]) return null;

  const expiresMatch = /Expires=([^;]+)/i.exec(header);
  return { refreshToken: valueMatch[1], expires: expiresMatch?.[1] ? new Date(expiresMatch[1]) : undefined };
}
