import { serverApi } from "@/shared/lib/api/server";

import { MOCK_PICK_STATUS, MOCK_TOP_GLOBAL, MOCK_USER_STATS } from "../lib/dashboard.mock";
import type { PickStatusData, TopGlobal, UserDashboardStats } from "../types/dashboard.types";

export const DASHBOARD_CACHE_TAG = "dashboard";

const USE_MOCK = process.env.NODE_ENV === "development";

export async function getUserDashboardStats(userId: string): Promise<UserDashboardStats | null> {
  if (USE_MOCK) return MOCK_USER_STATS;
  const response = await serverApi.get<UserDashboardStats>(`/dashboard/${userId}`, {
    next: { revalidate: 60, tags: [DASHBOARD_CACHE_TAG] },
  });
  if (!response.success || !response.data) return null;
  return response.data;
}

export async function getGlobalTop5(): Promise<TopGlobal | null> {
  if (USE_MOCK) return MOCK_TOP_GLOBAL;
  const response = await serverApi.get<TopGlobal>(`/dashboard/top`, {
    next: { revalidate: 60, tags: [DASHBOARD_CACHE_TAG] },
  });
  if (!response.success || !response.data) return null;
  return response.data;
}

export async function getUserPickStatus(userId: string): Promise<PickStatusData | null> {
  if (USE_MOCK) return MOCK_PICK_STATUS;
  const response = await serverApi.get<PickStatusData>(`/dashboard/${userId}/pick-status`, {
    next: { revalidate: 60, tags: [DASHBOARD_CACHE_TAG] },
  });
  if (!response.success || !response.data) return null;
  return response.data;
}
