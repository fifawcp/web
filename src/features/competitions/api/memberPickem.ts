import type { UserPickem } from "@/features/pickems/types/pickems.types";
import { api } from "@/shared/lib/api/client";

// A board member's committed tournament pick'em. The endpoint returns the same
// bare `UserPickem` the viewer's own `/api/pickems` does (no member wrapping), so
// the read-only renderers consume it directly; the member's identity comes from
// the competition leaderboard. Only revealed once the tournament has locked
// (the upstream 403s before kickoff) — callers expose the entry point only then.

export const memberPickemTag = (boardId: number, userId: string) => `member-pickem:${boardId}:${userId}` as const;
export const memberPickemKey = (boardId: number, userId: string) => ["member-pickem", boardId, userId] as const;

export async function fetchMemberPickem(boardId: number, userId: string): Promise<UserPickem> {
  const res = await api.get<UserPickem>(`/api/boards/${boardId}/members/${userId}/pickem`, { authenticated: true });
  if (!res.success || !res.data) throw new Error(res.error?.message ?? "Failed to load member pick'em");
  return res.data;
}
