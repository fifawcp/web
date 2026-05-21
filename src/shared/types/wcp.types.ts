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
