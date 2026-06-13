import type { BoardMember } from "@/features/boards/types/boards.types";
import type { Match, UserScorePick } from "@/features/schedule/types/schedule.types";

// A member shown in a reveal — same shape the picks endpoints return (board member
// identity + role + joined_at).
export type RevealMember = BoardMember;

export type MemberMatchPick = {
  member: RevealMember;
  pick: UserScorePick | null;
};

// GET /api/boards/{boardId}/matches/{matchId}/picks — how the whole board predicted one match.
export type BoardMatchPicks = {
  match: Match;
  picks: MemberMatchPick[];
};

// GET /api/boards/{boardId}/competitions/{competitionId}/members/{userId}/picks —
// a member's revealed picks across locked matches. Each match carries that
// member's prediction in `user_score_pick`; only locked matches are returned.
export type MemberCompetitionPicks = Match[];
