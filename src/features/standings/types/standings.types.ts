import type { GroupCode, Team } from "@/shared/types/wcp.types";

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

// Third-place playoff group ---------------------------------------------------

/** A third-placed team enriched with its cross-group ranking. */
export type ThirdPlaceRow = TeamStandingRow & {
  /** Rank among all 12 third-placed teams (1 = best). */
  third_place_rank: number;
  /** True when the team ranks in the qualifying slots and advances to the R32. */
  advances: boolean;
};

export type ThirdPlaceStandings = {
  rows: ThirdPlaceRow[];
  /** Third-placed teams that advance — 8 in the 48-team format. */
  qualifying_slots: number;
};

// Comparison with the user's pickem ------------------------------------------
//
// The pickem itself is typed by the `pickems` feature (`UserPickem`). Standings
// only consumes it through `buildPickIndex` / `buildBestThirdsSet`, so the
// types below describe the *derived* comparison state, not the raw pickem.

/** Which standings view is active. Persisted in the URL (`?view=compare`). */
export type StandingsViewMode = "normal" | "compare";

export type PickAccuracy = "exact" | "off_by_1" | "off_by_2_plus" | "not_picked";

export type RowComparison = {
  predicted_position: number | null;
  accuracy: PickAccuracy;
};

export type GroupComparison = {
  correct: number;
  total: number;
  isPerfect: boolean;
  /** Points earned in this group under the pickem scoring rules (see `lib/scoring`). */
  points: number;
  /** Maximum possible points for this group (4 teams × +3 exact). */
  maxPoints: number;
};

/** Per-group lookup of predicted positions, keyed by FIFA code. */
export type PickIndex = Map<string, Map<string, number>>;

/** Best-thirds accuracy for a single third-placed team. */
export type ThirdPlaceAccuracy = "correct" | "wrong" | "missed" | "not_picked";

export type ThirdPlaceComparison = {
  /** True when the user picked this team among their best thirds. */
  picked: boolean;
  accuracy: ThirdPlaceAccuracy;
};
