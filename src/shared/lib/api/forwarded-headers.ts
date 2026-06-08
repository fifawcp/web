import type { NextRequest } from "next/server";

type HeaderReader = Pick<Headers, "get">;

export function forwardedClientHeaders(req: NextRequest): Record<string, string> {
  const src = req.headers;
  const headers: Record<string, string> = {};

  const userAgent = src.get("user-agent");
  if (userAgent) headers["User-Agent"] = userAgent;

  const forwardedFor = src.get("x-forwarded-for") ?? src.get("x-real-ip");
  if (forwardedFor) headers["X-Forwarded-For"] = forwardedFor;

  return { ...headers, ...trustedClientIpHeaders(src) };
}

export function clientIpFromHeaders(src: HeaderReader): string | null {
  const forwardedFor = src.get("x-forwarded-for") ?? src.get("x-real-ip");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || null;
}

export function trustedClientIpHeaders(src: HeaderReader): Record<string, string> {
  const clientIp = clientIpFromHeaders(src);
  const secret = process.env.IP_FORWARD_SECRET;
  if (!clientIp || !secret) return {};

  return { "X-Client-IP": clientIp, "X-IP-Forward-Secret": secret };
}
