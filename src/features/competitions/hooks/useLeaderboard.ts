"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchLeaderboard, LEADERBOARD_PAGE_SIZE, leaderboardKey } from "../api/competitions";
import type { LeaderboardPage } from "../types/competitions.types";

type Params = {
  boardId: number;
  competitionId: number;
  page: number;
  q?: string;
  initialData?: LeaderboardPage;
};

export function useLeaderboard({ boardId, competitionId, page, q, initialData }: Params) {
  const normalizedQ = q ?? "";
  return useQuery({
    queryKey: leaderboardKey(boardId, competitionId, { page, q: normalizedQ }),
    queryFn: () => fetchLeaderboard(boardId, competitionId, { page, limit: LEADERBOARD_PAGE_SIZE, q: normalizedQ }),
    initialData: page === 1 && normalizedQ === "" ? initialData : undefined,
    placeholderData: keepPreviousData,
    enabled: Number.isFinite(boardId) && Number.isFinite(competitionId),
  });
}
