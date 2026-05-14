import { serverApi } from "@/shared/lib/api/server";

import { MOCK_DASHBOARD_LEADERBOARD, MOCK_DASHBOARD_STATS, MOCK_MATCH_PICK_PROGRESS, MOCK_TOURNAMENT_AWARDS, MOCK_USER_PICKEM_SUMMARY } from "../lib/dashboard.mock";
import type { DashboardLeaderboard, DashboardStats, MatchPickProgress, TournamentAwards, UserPickemSummary } from "../types/dashboard.types";

export const DASHBOARD_CACHE_TAG = "dashboard";

const USE_MOCK = process.env.NODE_ENV === "development";
// TODO: endpoint not yet available — returns null until deployed

export async function getDashboardStats(): Promise<DashboardStats | null> {
  if (USE_MOCK) return MOCK_DASHBOARD_STATS;
  const response = await serverApi.get<DashboardStats>("/dashboard/stats", {
    next: { revalidate: 60, tags: [DASHBOARD_CACHE_TAG] },
  });
  if (!response.success || !response.data) return null;
  return response.data;
}

export async function getMatchPickProgress(): Promise<MatchPickProgress | null> {
  if (USE_MOCK) return MOCK_MATCH_PICK_PROGRESS;
  const response = await serverApi.get<MatchPickProgress>("/matches/pick-progress", {
    next: { revalidate: 60, tags: [DASHBOARD_CACHE_TAG] },
  });
  if (!response.success || !response.data) return null;
  return response.data;
}

export async function getUserPickemSummary(): Promise<UserPickemSummary | null> {
  if (USE_MOCK) return MOCK_USER_PICKEM_SUMMARY;
  const response = await serverApi.get<UserPickemSummary>("/pickems", {
    next: { revalidate: 60, tags: [DASHBOARD_CACHE_TAG] },
  });
  if (!response.success || !response.data) return null;
  return response.data;
}

// Mocked — endpoint not yet available; structure is ready to swap in real data.
export async function getTournamentAwards(): Promise<TournamentAwards | null> {
  return MOCK_TOURNAMENT_AWARDS;
}

export async function getDashboardLeaderboard(): Promise<DashboardLeaderboard | null> {
  if (USE_MOCK) return MOCK_DASHBOARD_LEADERBOARD;
  const response = await serverApi.get<DashboardLeaderboard>("/dashboard/leaderboard", {
    next: { revalidate: 60, tags: [DASHBOARD_CACHE_TAG] },
  });
  if (!response.success || !response.data) return null;
  return response.data;
}
