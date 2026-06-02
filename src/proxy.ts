import { NextResponse, type NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";
import { encode, getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";

import { routing, type Locale } from "@/i18n/routing";
import { env } from "@/lib/env";
import { HARD_AUTH_FAILURE_CODES } from "@/shared/lib/api/errors";
import { isTokenStale } from "@/shared/lib/api/jwt";

// Authenticated users are redirected away from these routes (locale-stripped paths).
const GUEST_ONLY_ROUTES = new Set(["/login", "/register", "/callback"]);

// Routes that require a session. Everything else is public (the SEO-safe default —
// new public pages like /standings need no change here). Compared against locale-stripped paths.
function isProtectedPath(path: string): boolean {
  // The invite landing under /boards/join/* is public.
  if (path.startsWith("/boards/join/")) return false;
  return path === "/pickems" || path === "/profile" || path === "/boards" || path.startsWith("/boards/");
}

// Mirror next-auth's session cookie name convention
const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token";

const REFRESH_COOKIE = "refresh_token";
const SECRET = env.NEXTAUTH_SECRET;
const SESSION_MAX_AGE = env.NEXTAUTH_SESSION_MAX_AGE;
const SECURE_COOKIES = process.env.NODE_ENV === "production";

const handleI18nRouting = createMiddleware(routing);

// Splits a (possibly locale-prefixed) pathname into the active locale and the
// unprefixed path. With `as-needed`, the default locale is served unprefixed.
function splitLocale(pathname: string): { locale: Locale; path: string } {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.slice(locale.length + 1) || "/" };
    }
  }
  return { locale: routing.defaultLocale, path: pathname };
}

// Re-prepends the active locale prefix to an internal target (no prefix for the default locale).
function localePath(locale: Locale, target: string): string {
  if (locale === routing.defaultLocale) return target;
  return target === "/" ? `/${locale}` : `/${locale}${target}`;
}

// Layer next-intl's locale rewrite + hreflang link header + locale cookie onto an
// auth response, so a pass-through that also mutates the request still renders the
// correct locale (notably the default-locale `/...` → `/en/...` internal rewrite).
function withI18n(response: NextResponse, i18n: NextResponse): NextResponse {
  i18n.headers.forEach((value, key) => {
    if (key === "x-middleware-rewrite" || key === "link" || key.startsWith("x-next-intl")) {
      response.headers.set(key, value);
    }
  });
  i18n.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

export default async function proxy(req: NextRequest) {
  // 1. Locale routing first: handles prefixing, the locale cookie, hreflang headers,
  //    and any locale redirect (e.g. a non-default cookie on the unprefixed path).
  const i18nResponse = handleI18nRouting(req);
  if (i18nResponse.headers.has("location")) return i18nResponse;

  const { locale, path } = splitLocale(req.nextUrl.pathname);
  const localized = (target: string) => new URL(localePath(locale, target), req.url);

  const token = await getToken({ req, secret: SECRET, secureCookie: SECURE_COOKIES });
  const accessToken = token?.access_token as string | undefined;

  // Authenticated users with a fresh token don't belong on guest-only pages.
  if (GUEST_ONLY_ROUTES.has(path)) {
    if (accessToken && !isTokenStale(accessToken)) return NextResponse.redirect(localized("/"));
    return i18nResponse;
  }

  // Protected pages require a session.
  if (isProtectedPath(path) && !accessToken) {
    return NextResponse.redirect(localized("/login"));
  }

  // Proactively refresh a near-expiry token so the RSC always renders with a fresh
  // one (serverApi trusts the middleware to keep the token fresh).
  if (accessToken && isTokenStale(accessToken)) {
    const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

    // No refresh token on the Next domain — session is unrecoverable. Clear the
    // NextAuth cookie so the login page doesn't bounce the user back.
    if (!refreshToken) return expiredSessionRedirect(localized("/login"));

    const refreshed = await refreshUpstream(refreshToken);
    if (refreshed === "hard-failure") return expiredSessionRedirect(localized("/login"));

    // On transient failure, let the request through — the RSC will hit a 401 and
    // redirect to /login from there. Better than an incorrect forced sign-out.
    if (refreshed) return applyRefreshedToken(req, token!, refreshed, i18nResponse);
  }

  return i18nResponse;
}

export const config = {
  // Run on every pathname except API routes, Next internals, and files with an
  // extension (covers sitemap.xml, robots.txt, manifest.webmanifest, og.png, etc.).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
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
      // Only a known hard-auth code is permanent (cookie gone, or token invalid
      // beyond the backend's rotation grace window). A transient/uncoded 401 — e.g.
      // a refresh that lost a rotation race — is recoverable: return null so the
      // request rides through instead of force-clearing the session.
      return HARD_AUTH_FAILURE_CODES.has(code) ? "hard-failure" : null;
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
// the current RSC render and all subsequent requests see the fresh tokens, while
// preserving next-intl's locale rewrite/headers.
async function applyRefreshedToken(req: NextRequest, token: JWT, refreshed: RefreshSuccess, i18nResponse: NextResponse): Promise<NextResponse> {
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
    secure: SECURE_COOKIES,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Forward the rotated refresh token from the API.
  // path="/" is intentional, the middleware reads this cookie on every protected-route
  // navigation (e.g. "/", "/boards"), so it must be visible on all paths, not just "/api/auth".
  response.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, {
    httpOnly: true,
    secure: SECURE_COOKIES,
    sameSite: "lax",
    path: "/",
    ...(refreshed.expires && { expires: refreshed.expires }),
  });

  return withI18n(response, i18nResponse);
}

// Redirects to (locale-aware) /login and clears the NextAuth session cookie so the
// login page doesn't treat the user as still authenticated and bounce them back.
function expiredSessionRedirect(target: URL): NextResponse {
  const response = NextResponse.redirect(target);
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
