export type StageCode = "group_stage" | "round_of_32" | "round_of_16" | "quarterfinals" | "semifinals" | "third_place" | "final";

export type MatchStatus = "scheduled" | "finished";

export type GroupCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export type LocalizedName = Record<string, string>;

export type Team = {
  fifa_code: string;
  name: LocalizedName;
  flag_url: string;
  group_code: GroupCode | null;
};

export type Teams = {
  home: Team | null;
  away: Team | null;
};

export type Venue = {
  name: string;
  city: string;
};

export type MatchPenalties = {
  home: number;
  away: number;
};

export type MatchResult = {
  home_score: number;
  away_score: number;
  penalties: MatchPenalties | null;
  winner_team_fifa_code: string | null;
};

export type UserScorePick = {
  home_score: number;
  away_score: number;
};

export type Match = {
  id: number;
  stage_code: StageCode;
  group_code: GroupCode | null;
  teams: Teams;
  venue: Venue;
  kickoff_at: string;
  status: MatchStatus;
  result: MatchResult | null;
  user_score_pick: UserScorePick | null;
};

export type PickFilter = "all" | "pending" | "picked";

export type ScheduleFilters = {
  stage: StageCode | "all";
  group: GroupCode | "all";
  team: string | "all";
  matchStatus: MatchStatus | "all";
  pick: PickFilter;
};

export const DEFAULT_FILTERS: ScheduleFilters = {
  stage: "all",
  group: "all",
  team: "all",
  matchStatus: "all",
  pick: "all",
};
