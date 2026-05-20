import type { GroupCode, StageCode, Team } from "@/shared/types/wcp.types";

export type RankedTeam = Team & {
  position: number;
};

export type ResolvedGroupPick = {
  group_code: GroupCode;
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
