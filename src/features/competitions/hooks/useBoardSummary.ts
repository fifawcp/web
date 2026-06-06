"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { boardSummaryKey, fetchBoardSummary, LEADERBOARD_PAGE_SIZE } from "../api/competitions";

type Params = {
  boardId: number;
  page: number;
  q?: string;
  sort?: string;
  dir?: string;
  enabled: boolean;
};

// Board-wide standings. Fetched only while the Resumen tab is open (enabled).
export function useBoardSummary({ boardId, page, q, sort, dir, enabled }: Params) {
  const normalizedQ = q ?? "";
  const normalizedSort = sort ?? "total";
  const normalizedDir = dir ?? "desc";
  return useQuery({
    queryKey: boardSummaryKey(boardId, { page, q: normalizedQ, sort: normalizedSort, dir: normalizedDir }),
    queryFn: () => fetchBoardSummary(boardId, { page, limit: LEADERBOARD_PAGE_SIZE, q: normalizedQ, sort: normalizedSort, dir: normalizedDir }),
    placeholderData: keepPreviousData,
    enabled: enabled && Number.isFinite(boardId),
  });
}
