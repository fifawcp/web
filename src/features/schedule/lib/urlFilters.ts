import { DEFAULT_FILTERS, type GroupCode, type MatchStatus, type ScheduleFilters, type StageCode } from "../types/schedule.types";

const STAGE_VALUES = new Set<StageCode | "all">(["all", "group_stage", "round_of_32", "round_of_16", "quarterfinals", "semifinals", "third_place", "final"]);
const GROUP_VALUES = new Set<GroupCode | "all">(["all", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]);
const STATUS_VALUES = new Set<MatchStatus | "all">(["all", "scheduled", "finished"]);

export function paramsToFilters(params: URLSearchParams | { get(name: string): string | null }): ScheduleFilters {
  return {
    stage: pick(params.get("stage"), STAGE_VALUES, DEFAULT_FILTERS.stage),
    group: pick(params.get("group"), GROUP_VALUES, DEFAULT_FILTERS.group),
    team: params.get("team") ?? DEFAULT_FILTERS.team,
    matchStatus: pick(params.get("status"), STATUS_VALUES, DEFAULT_FILTERS.matchStatus),
  };
}

export function filtersToParams(filters: ScheduleFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.stage !== "all") params.set("stage", filters.stage);
  if (filters.group !== "all") params.set("group", filters.group);
  if (filters.team !== "all") params.set("team", filters.team);
  if (filters.matchStatus !== "all") params.set("status", filters.matchStatus);
  return params;
}

function pick<T extends string>(value: string | null, allowed: Set<T>, fallback: T): T {
  return value && (allowed as Set<string>).has(value) ? (value as T) : fallback;
}
