import { NextRequest } from "next/server";

import { proxyToBackend } from "../../_lib/proxy";

// `/api/awards/*` is excluded from the catch-all rewrite, so this read needs
// its own handler. Pure proxy — popular picks are derived data, nothing to
// revalidate.
export async function GET(req: NextRequest) {
  return proxyToBackend(req, { path: "/api/awards/popular", method: "GET" });
}
