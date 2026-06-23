import { serverApi } from "@/shared/lib/api/server";

import { normalizeNextMatches } from "../lib/normalizeNextMatches";
import type { DashboardData, NextMatchPayload } from "../types/dashboard.types";

export const DASHBOARD_CACHE_TAG = "dashboard";

// The wire shape: identical to DashboardData except `next_match` may arrive as a
// single object (original API) or an array (post-change API) — see NextMatchPayload.
type DashboardApiResponse = Omit<DashboardData, "next_match"> & { next_match?: NextMatchPayload };

// GET /dashboard — consolidated payload: champion, stats, next match, progress,
// leaderboard, and title favorites. `next_match` is normalized to an array so the
// dashboard works whether the API sends one match or several simultaneous ones.
export async function getDashboard(isAuthenticated: boolean): Promise<DashboardData | null> {
  const response = await serverApi.get<DashboardApiResponse>("/api/dashboard", {
    authenticated: isAuthenticated,
    next: { revalidate: 60, tags: [DASHBOARD_CACHE_TAG] },
  });

  if (!response.success || !response.data) return null;

  return { ...response.data, next_match: normalizeNextMatches(response.data.next_match) };
}
