import type { GroupCode, Team } from "@/features/schedule/types/schedule.types";

export type QualificationStatus = "advances_to_r32" | "best_third_playoff" | "eliminated";

/** Raw row shape returned by `/standings` (snake_case matches backend). */
export type StandingRow = {
  team: Team;
  position: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  fair_play_score?: number;
};

/** A standing row enriched with the qualification status derived client-side. */
export type TeamStandingRow = StandingRow & {
  qualification_status: QualificationStatus;
};

export type GroupStandings = {
  group_code: GroupCode;
  matchday: number;
  total_matchdays: number;
  rows: TeamStandingRow[];
};

// Pickems / comparison ------------------------------------------------------

export type PickPosition = {
  fifa_code: string;
  flag_url: string;
  group_code: string;
  name: Record<string, string>;
  position: number;
};

export type GroupPick = {
  group_code: string;
  teams: PickPosition[];
};

export type PickemState = {
  stage_code?: string;
  group_picks: GroupPick[];
  is_locked?: boolean;
};

export type PickAccuracy = "exact" | "off_by_1" | "off_by_2_plus" | "not_picked";

export type RowComparison = {
  predicted_position: number | null;
  /** predicted - actual: positive = team finished worse than predicted; negative = better. */
  delta: number | null;
  accuracy: PickAccuracy;
};

export type GroupComparison = {
  correct: number;
  total: number;
  isPerfect: boolean;
};

/** Per-group lookup of predicted positions, keyed by FIFA code. */
export type PickIndex = Map<string, Map<string, number>>;
