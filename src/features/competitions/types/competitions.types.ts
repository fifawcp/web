import type { StageCode } from "@/shared/types/wcp.types";

export type CompetitionType = "pickem" | "match" | "pool";

export type CompetitionScope = {
  stages: StageCode[];
  team_fifa_codes: string[];
};

export type CompetitionViewer = {
  rank: number;
  total_points: number;
};

export type Competition = {
  id: number;
  board_id: number;
  type: CompetitionType;
  name: string;
  scope: CompetitionScope | null;
  // Only set for `pool` competitions — the single match they cover.
  pool_match_id: number | null;
  created_at: string;
  viewer: CompetitionViewer;
};

export type PickemScore = {
  total: number;
  group_exact_positions: number;
  group_qualifier_hits: number;
  best_third_hits: number;
  bracket_hits: number;
};

export type MatchScore = {
  total: number;
  exact_hits: number;
  correct_outcomes: number;
};

export type CompetitionScore = PickemScore | MatchScore;

export type LeaderboardMember = {
  user_id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
};

export type LeaderboardEntry = {
  member: LeaderboardMember;
  rank: number;
  score: CompetitionScore;
};

export type LeaderboardPage = {
  items: LeaderboardEntry[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
};

export type CreateMatchCompetitionInput = {
  name: string;
  type: "match";
  scope: CompetitionScope;
};

export type CreatePoolCompetitionInput = {
  name: string;
  type: "pool";
  match_id: number;
};

// Pick'em is auto-seeded as the board's anchor competition and is never created here.
export type CreateCompetitionInput = CreateMatchCompetitionInput | CreatePoolCompetitionInput;
