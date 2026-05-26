import { NextRequest, NextResponse } from "next/server";

import { forwardedClientHeaders, rewriteRefreshCookie, UPSTREAM } from "../../../auth/_lib/token-proxy";

// BFF handler for the Google OAuth callback. This is the one auth entry point that
// would otherwise bypass the refresh-cookie reconciliation every other auth route
// goes through (see ../../../auth/token/route.ts). Owning it lets us:
//   1. Run rewriteRefreshCookie on the backend's Set-Cookie, so the new token lands
//      at Path=/ (overwriting any stale previous-session cookie) and the Path=/api/auth
//      copy is cleared — the browser never even stores the backend's /api/auth cookie.
//   2. Avoid forwarding the incoming (possibly stale) refresh_token cookie upstream;
//      the callback authenticates purely via the state/code query params (state is
//      validated against Redis), so no cookies are needed.
export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/api/oauth/google/callback${search}`, {
      method: "GET",
      headers: { ...forwardedClientHeaders(req) },
      redirect: "manual",
    });
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Success: backend responds 3xx -> return_to, carrying the new refresh-token cookie.
  const location = upstream.headers.get("location");
  if (upstream.status >= 300 && upstream.status < 400 && location) {
    const res = NextResponse.redirect(new URL(location, req.url));
    rewriteRefreshCookie(upstream.headers.get("set-cookie"), res);
    return res;
  }

  // Failure (unknown/expired state, unverified email, token-exchange error, …):
  // the backend returns a JSON error instead of a redirect. Send the user back to login.
  return NextResponse.redirect(new URL("/login", req.url));
}
