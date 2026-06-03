import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { forwardedClientHeaders, REFRESH_COOKIE, rewriteRefreshCookie, UPSTREAM } from "../../_lib/token-proxy";

// Proxy handler for token refresh. Owning this route serves two purposes:
//  1. Reads the refresh-token cookie server-side and passes it explicitly to the upstream.
//  2. Re-sets the rotated refresh-token cookie with path="/", so the Next.js
//     middleware can read it on subsequent protected-route navigations.
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const rt = cookieStore.get(REFRESH_COOKIE)?.value;

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/api/auth/token/refresh`, {
      method: "POST",
      headers: {
        ...(rt && { Cookie: `${REFRESH_COOKIE}=${rt}` }),
        ...forwardedClientHeaders(req),
        "X-Refresh-Source": "client",
      },
    });
  } catch {
    return NextResponse.json({ error: { code: "NETWORK_ERROR", message: "Upstream unreachable" } }, { status: 502 });
  }

  const body = await upstream.json().catch(() => ({}));
  const res = NextResponse.json(body, { status: upstream.status });

  if (upstream.ok) {
    rewriteRefreshCookie(upstream.headers.get("set-cookie"), res);
  }

  return res;
}
