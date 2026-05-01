import { NextRequest, NextResponse } from "next/server";

import { forwardedClientHeaders, rewriteRefreshCookie, UPSTREAM } from "../_lib/token-proxy";

// Proxy handler for the token-exchange endpoint (login + registration).
// Owning this route lets us re-set the refresh-token cookie with path="/" so
// the Next.js middleware can read it on protected-route navigations like "/"
// and "/boards", which it cannot do if the API uses path="/api/auth".
export async function POST(req: NextRequest) {
  const body = await req.text();

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/api/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...forwardedClientHeaders(req) },
      body,
    });
  } catch {
    return NextResponse.json({ error: { code: "NETWORK_ERROR", message: "Upstream unreachable" } }, { status: 502 });
  }

  const responseBody = await upstream.json().catch(() => ({}));
  const res = NextResponse.json(responseBody, { status: upstream.status });

  if (upstream.ok) {
    rewriteRefreshCookie(upstream.headers.get("set-cookie"), res);
  }

  return res;
}
