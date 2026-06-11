import { NextRequest } from "next/server";

import { DASHBOARD_CACHE_TAG } from "@/features/dashboard/api/dashboard.api";
import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";

import { proxyToBackend } from "../../../_lib/proxy";

// Proxies the upstream PUT and busts the matches + dashboard fetch caches on
// success so both the schedule RSC and the dashboard's featured card reflect the
// new pick on the next render.
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return proxyToBackend(req, { path: `/api/matches/${id}/pick`, method: "PUT", revalidate: [MATCHES_CACHE_TAG, DASHBOARD_CACHE_TAG] });
}
