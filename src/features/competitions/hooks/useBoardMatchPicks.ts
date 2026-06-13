"use client";

import { useQuery } from "@tanstack/react-query";

import { boardMatchPicksKey, fetchBoardMatchPicks } from "../api/predictions";
import type { BoardMatchPicks } from "../types/predictions.types";

// Matches the server revalidate so a fresh RSC seed isn't treated as stale on mount.
const STALE_TIME_MS = 30_000;

export function useBoardMatchPicks(boardId: number, matchId: number, initialData?: BoardMatchPicks, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: boardMatchPicksKey(boardId, matchId),
    queryFn: () => fetchBoardMatchPicks(boardId, matchId),
    initialData,
    staleTime: STALE_TIME_MS,
    enabled: Number.isFinite(boardId) && Number.isFinite(matchId) && (options?.enabled ?? true),
  });
}
