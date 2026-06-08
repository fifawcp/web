import type { NextRequest } from "next/server";

export function forwardedClientHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers["User-Agent"] = userAgent;

  const forwardedFor = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  if (forwardedFor) headers["X-Forwarded-For"] = forwardedFor;

  return { ...headers, ...trustedClientIpHeaders(req) };
}

export function clientIpFromRequest(req: NextRequest): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || null;
}

export function trustedClientIpHeaders(req: NextRequest): Record<string, string> {
  const clientIp = clientIpFromRequest(req);
  const secret = process.env.IP_FORWARD_SECRET;
  if (!clientIp || !secret) return {};

  return { "X-Client-IP": clientIp, "X-IP-Forward-Secret": secret };
}
