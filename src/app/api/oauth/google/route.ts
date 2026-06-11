import { NextRequest, NextResponse } from "next/server";

import { forwardedClientHeaders } from "@/shared/lib/api/forwarded-headers";

const UPSTREAM = process.env.BACKEND_API_URL!;

export async function GET(req: NextRequest) {
  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/api/oauth/google${req.nextUrl.search}`, {
      method: "GET",
      headers: { ...forwardedClientHeaders(req) },
      redirect: "manual",
    });
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const location = upstream.headers.get("location");
  if (upstream.status >= 300 && upstream.status < 400 && location) {
    return NextResponse.redirect(new URL(location, req.url));
  }

  return NextResponse.redirect(new URL("/login", req.url));
}
