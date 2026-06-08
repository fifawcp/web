import { NextRequest } from "next/server";

import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";

import { proxyToBackend } from "../../../_lib/proxy";

// Proxies the upstream PUT and busts the matches fetch cache on success so the
// schedule RSC reflects the new pick on the next render.
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyToBackend(req, { path: `/api/matches/${id}/pick`, method: "PUT", revalidate: [MATCHES_CACHE_TAG] });
}
