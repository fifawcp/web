import type { GroupCode, StageCode, Team } from "@/shared/types/wcp.types";

export type RankedTeam = Omit<Team, "group_code"> & {
  group_code: GroupCode;
  position: number;
};

export type ResolvedGroupPick = {
  group_code: GroupCode;
  locked: boolean;
  teams: RankedTeam[];
};

export type BracketStageCode = Exclude<StageCode, "group_stage">;

export type BracketMatchSlot = {
  match_id: number;
  stage_code: BracketStageCode;
  home_team: Team | null;
  away_team: Team | null;
  picked_team: Team | null;
};

/**
 * Optional read-only compare overlay for a bracket match card. Set by the
 * `/bracket` page when comparing the user's predictions against real results;
 * `undefined` in the normal pick flow. Defined here (not in the `bracket`
 * feature) so the dependency only ever points bracket → pickems, never back.
 *
 * `homeCorrect` / `awayCorrect` flag each team row to be highlighted green —
 * meaning the user correctly predicted that team to reach this match's stage
 * (or, for the final/third-place match, to win it). Scoring rules live in the
 * `bracket` feature; the card only needs the two booleans to render.
 */
export type BracketMatchCompare = {
  homeCorrect: boolean;
  awayCorrect: boolean;
};

export type StepProgress = {
  completed: number;
  total: number;
};

export type PickemProgress = {
  groups: StepProgress;
  best_thirds: StepProgress;
  bracket: StepProgress;
};

export type UserPickem = {
  group_picks: ResolvedGroupPick[];
  best_thirds: Team[];
  bracket: BracketMatchSlot[];
  progress: PickemProgress;
  is_locked: boolean;
};

export type PickemStep = "groups" | "thirds" | "bracket";

export type GroupPickPayload = {
  group_code: GroupCode;
  team_fifa_codes: [string, string, string, string];
  locked: boolean;
};

export type SaveGroupPicksPayload = {
  group_picks: GroupPickPayload[];
};

export type SaveBestThirdsPayload = {
  team_fifa_codes: string[];
};

export type BracketPickPayload = {
  match_id: number;
  team_fifa_code: string;
};

export type SaveBracketPicksPayload = {
  bracket_picks: BracketPickPayload[];
};

export type BracketDraft = Record<number, string>;
