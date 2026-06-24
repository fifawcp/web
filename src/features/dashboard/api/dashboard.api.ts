import { serverApi } from "@/shared/lib/api/server";

import { resolveNextMatches } from "../lib/resolveNextMatches";
import type { DashboardData, Match } from "../types/dashboard.types";

export const DASHBOARD_CACHE_TAG = "dashboard";

// The wire shape: `next_matches` is the primary array; `next_match` is a single-object
// fallback. Both optional so the resolver can pick whichever the API sends.
type DashboardApiResponse = Omit<DashboardData, "next_matches"> & {
  next_matches?: Match[] | null;
  next_match?: Match | null;
};

// GET /dashboard — consolidated payload: champion, stats, next match(es), progress,
// leaderboard, and title favorites. `next_matches` is resolved to an array so the
// dashboard works whether the API sends the array or just the fallback object.
export async function getDashboard(isAuthenticated: boolean): Promise<DashboardData | null> {
  const response = await serverApi.get<DashboardApiResponse>("/api/dashboard", {
    authenticated: isAuthenticated,
    next: { revalidate: 60, tags: [DASHBOARD_CACHE_TAG] },
  });

  if (!response.success || !response.data) return null;

  return { ...response.data, next_matches: resolveNextMatches(response.data) };
}
