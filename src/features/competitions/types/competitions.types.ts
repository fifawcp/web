import type { StageCode } from "@/shared/types/wcp.types";

export type CompetitionType = "pickem" | "match" | "pick" | "awards";

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
  // Only set for `pick` competitions — the single match they cover.
  pick_match_id: number | null;
  created_at: string;
  viewer: CompetitionViewer;
  // Top members previewed on the card — supplied with the list so no extra call is needed.
  top_preview: LeaderboardEntry[];
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

export type AwardsScore = {
  total: number;
  golden_boot: number;
  golden_ball: number;
  golden_glove: number;
  young_player: number;
};

export type CompetitionScore = PickemScore | MatchScore | AwardsScore;

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

// Board-wide standing: per-type subtotals + raw-sum total. `custom` = match competitions.
export type BoardSummaryEntry = {
  member: LeaderboardMember;
  rank: number;
  total: number;
  pickem: number;
  custom: number;
  pick: number;
  awards: number;
};

export type BoardSummaryPage = {
  items: BoardSummaryEntry[];
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

export type CreatePickCompetitionInput = {
  name: string;
  type: "pick";
  match_id: number;
};

export type CreatePickemCompetitionInput = {
  name: string;
  type: "pickem";
};

export type CreateAwardsCompetitionInput = {
  name: string;
  type: "awards";
};

export type CreateCompetitionInput = CreateMatchCompetitionInput | CreatePickCompetitionInput | CreatePickemCompetitionInput | CreateAwardsCompetitionInput;
