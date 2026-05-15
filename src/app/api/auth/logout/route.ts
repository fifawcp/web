import { NextRequest, NextResponse } from "next/server";

import { forwardedClientHeaders, REFRESH_COOKIE, UPSTREAM } from "../_lib/token-proxy";

// The backend sets the cookie at Path=/api/auth; the BFF rewrites it to Path=/.
// Both must be cleared on logout — the upstream directive only covers its own path
const REFRESH_COOKIE_PATHS = ["/", "/api/auth"] as const;
export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/api/auth/logout`, {
      method: "POST",
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
        ...forwardedClientHeaders(req),
      },
    });
  } catch {
    return NextResponse.json({ error: { code: "NETWORK_ERROR", message: "Upstream unreachable" } }, { status: 502 });
  }

  const body = await upstream.text();
  const res = body.length > 0 ? new NextResponse(body, { status: upstream.status }) : new NextResponse(null, { status: upstream.status });

  // Use headers.append, not cookies.set — the cookies API is keyed by name only,
  // so two calls for the same cookie at different paths would clobber each other
  const secureSuffix = process.env.NODE_ENV === "production" ? "; Secure" : "";
  for (const path of REFRESH_COOKIE_PATHS) {
    res.headers.append("Set-Cookie", `${REFRESH_COOKIE}=; Path=${path}; Max-Age=0; HttpOnly; SameSite=Lax${secureSuffix}`);
  }

  return res;
}
