import { serverApi } from "@/shared/lib/api/server";

import type { DashboardData } from "../types/dashboard.types";

export const DASHBOARD_CACHE_TAG = "dashboard";

// GET /dashboard — consolidated payload: champion, stats, next match, progress,
// leaderboard, and title favorites. All fields come straight from the API.
export async function getDashboard(isAuthenticated: boolean): Promise<DashboardData | null> {
  const response = await serverApi.get<DashboardData>("/api/dashboard", {
    authenticated: isAuthenticated,
    next: { revalidate: 60, tags: [DASHBOARD_CACHE_TAG] },
  });

  if (!response.success || !response.data) return null;

  return response.data;
}
