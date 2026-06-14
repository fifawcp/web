import { api } from "@/shared/lib/api/client";
import { ApiClientError } from "@/shared/lib/api/errors";
import { ApiResponse } from "@/shared/lib/api/types";

import type { Match, UserScorePick } from "../types/schedule.types";

export const MATCHES_QUERY_KEY = ["matches"] as const;
export const MATCHES_CACHE_TAG = "matches";

export async function fetchMatches(): Promise<Match[]> {
  const res = await api.get<Match[]>("/api/matches", { authenticated: true });
  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? "Failed to load matches");
  }

  return res.data;
}

export type SavePickInput = {
  matchId: number;
  pick: UserScorePick;
};

export async function savePick({ matchId, pick }: SavePickInput): Promise<void> {
  const res: ApiResponse<void> = await api.put(`/api/matches/${matchId}/pick`, pick, { authenticated: true });
  if (!res.success) {
    throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? "Failed to save pick");
  }
}
