import { NextRequest } from "next/server";

import { proxyToBackend } from "../../../_lib/proxy";

// Dedicated proxy for the OTP endpoints (/api/auth/otp/request, /api/auth/otp/verify).
// Runs in the Node runtime so forwardedClientHeaders attaches the trusted X-Client-IP —
// OTP send is IP-rate-limited, so the real client IP must reach the backend. This nested
// route out-prioritizes the /api/auth/[...nextauth] catch-all, which would otherwise
// swallow these paths; it replaces the former next.config beforeFiles rewrite.
type Ctx = { params: Promise<{ rest: string[] }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { rest } = await params;
  return proxyToBackend(req, { path: `/api/auth/otp/${rest.join("/")}`, method: "POST" });
}
