"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMemberCompetitionPicks, memberCompetitionPicksKey } from "../api/predictions";

const STALE_TIME_MS = 30_000;

// `userId` is null while the member dialog is closed — the query stays disabled
// until a member is selected.
export function useMemberCompetitionPicks(boardId: number, competitionId: number, userId: string | null) {
  return useQuery({
    queryKey: memberCompetitionPicksKey(boardId, competitionId, userId ?? ""),
    queryFn: () => fetchMemberCompetitionPicks(boardId, competitionId, userId as string),
    staleTime: STALE_TIME_MS,
    enabled: Boolean(userId) && Number.isFinite(boardId) && Number.isFinite(competitionId),
  });
}
