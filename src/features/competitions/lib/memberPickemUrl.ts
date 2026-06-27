import { displayName } from "@/shared/lib/ui";

import type { LeaderboardMember } from "../types/competitions.types";

// Deep link to a member's revealed tournament pick'em. The display name (`n`) and
// handle (`u`) ride along so the page header titles itself correctly even before
// the roster/leaderboard lookup resolves (or when the member sits past its window).
export function memberPickemPath(boardId: number, competitionId: number, member: LeaderboardMember): string {
  const params = new URLSearchParams({ n: displayName(member.username, member.first_name, member.last_name), u: member.username });
  return `/boards/${boardId}/competitions/${competitionId}/members/${member.user_id}?${params.toString()}`;
}
