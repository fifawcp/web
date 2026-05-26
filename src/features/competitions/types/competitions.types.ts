import type { StageCode } from "@/shared/types/wcp.types";

export type CompetitionType = "pickem" | "match";

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

export const isPickemScore = (score: CompetitionScore, type: CompetitionType): score is PickemScore => type === "pickem";
export const isMatchScore = (score: CompetitionScore, type: CompetitionType): score is MatchScore => type === "match";

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

export type CreateCompetitionInput = {
  name: string;
  type: "match";
  scope: CompetitionScope;
};
