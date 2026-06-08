import type { NextRequest } from "next/server";

export function forwardedClientHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers["User-Agent"] = userAgent;

  const forwardedFor = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  if (forwardedFor) headers["X-Forwarded-For"] = forwardedFor;

  return headers;
}
