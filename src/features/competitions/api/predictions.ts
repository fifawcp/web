import type { Match } from "@/features/schedule/types/schedule.types";
import { api } from "@/shared/lib/api/client";

import type { BoardMatchPicks } from "../types/predictions.types";

export const boardMatchPicksTag = (boardId: number, matchId: number) => `board-match-picks:${boardId}:${matchId}` as const;
export const memberCompetitionPicksTag = (boardId: number, competitionId: number, userId: string) =>
  `member-competition-picks:${boardId}:${competitionId}:${userId}` as const;

export const boardMatchPicksKey = (boardId: number, matchId: number) => ["board-match-picks", boardId, matchId] as const;
export const memberCompetitionPicksKey = (boardId: number, competitionId: number, userId: string) =>
  ["member-competition-picks", boardId, competitionId, userId] as const;

// How the whole board predicted one match. Throws if the match isn't locked yet
// (the upstream 403) — callers only expose this once a match is locked.
export async function fetchBoardMatchPicks(boardId: number, matchId: number): Promise<BoardMatchPicks> {
  const res = await api.get<BoardMatchPicks>(`/api/boards/${boardId}/matches/${matchId}/picks`, { authenticated: true });
  if (!res.success || !res.data) throw new Error(res.error?.message ?? "Failed to load match predictions");
  return res.data;
}

// A member's revealed picks across the competition's locked matches (empty when none).
export async function fetchMemberCompetitionPicks(boardId: number, competitionId: number, userId: string): Promise<Match[]> {
  const res = await api.get<Match[]>(`/api/boards/${boardId}/competitions/${competitionId}/members/${userId}/picks`, { authenticated: true });
  if (!res.success || !res.data) throw new Error(res.error?.message ?? "Failed to load member predictions");
  return res.data;
}
