"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchLeaderboard, LEADERBOARD_PAGE_SIZE, leaderboardKey } from "../api/competitions";
import type { LeaderboardPage } from "../types/competitions.types";

type Params = {
  boardId: number;
  competitionId: number;
  page: number;
  q?: string;
  sort?: string;
  dir?: string;
  initialData?: LeaderboardPage;
};

export function useLeaderboard({ boardId, competitionId, page, q, sort, dir, initialData }: Params) {
  const normalizedQ = q ?? "";
  const normalizedSort = sort ?? "total";
  const normalizedDir = dir ?? "desc";
  // The RSC seed is the default (total, desc) first page — only reuse it then.
  const isDefault = page === 1 && normalizedQ === "" && normalizedSort === "total" && normalizedDir === "desc";
  return useQuery({
    queryKey: leaderboardKey(boardId, competitionId, { page, q: normalizedQ, sort: normalizedSort, dir: normalizedDir }),
    queryFn: () => fetchLeaderboard(boardId, competitionId, { page, limit: LEADERBOARD_PAGE_SIZE, q: normalizedQ, sort: normalizedSort, dir: normalizedDir }),
    initialData: isDefault ? initialData : undefined,
    placeholderData: keepPreviousData,
    enabled: Number.isFinite(boardId) && Number.isFinite(competitionId),
  });
}
