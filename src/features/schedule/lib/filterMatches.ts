import type { Match, ScheduleFilters } from "../types/schedule.types";

export function filterMatches(matches: Match[], filters: ScheduleFilters): Match[] {
  return matches.filter((m) => {
    if (filters.stage !== "all" && m.stage_code !== filters.stage) return false;
    if (filters.group !== "all" && m.group_code !== filters.group) return false;
    if (filters.matchStatus !== "all" && m.status !== filters.matchStatus) return false;

    if (filters.team !== "all") {
      const home = m.teams.home?.fifa_code;
      const away = m.teams.away?.fifa_code;
      if (home !== filters.team && away !== filters.team) return false;
    }

    return true;
  });
}

export function activeFilterCount(filters: ScheduleFilters): number {
  let count = 0;
  if (filters.stage !== "all") count++;
  if (filters.group !== "all") count++;
  if (filters.team !== "all") count++;
  if (filters.matchStatus !== "all") count++;
  return count;
}
