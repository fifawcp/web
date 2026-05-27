import type { Match, PickFilter, ScheduleFilters } from "../types/schedule.types";

export function filterMatches(matches: Match[], filters: ScheduleFilters, now: Date = new Date()): Match[] {
  const nowMs = now.getTime();

  return matches.filter((m) => {
    if (filters.stage !== "all" && m.stage_code !== filters.stage) return false;
    if (filters.group !== "all" && m.group_code !== filters.group) return false;
    if (filters.matchStatus !== "all" && m.status !== filters.matchStatus) return false;

    if (filters.team !== "all") {
      const home = m.teams.home?.fifa_code;
      const away = m.teams.away?.fifa_code;
      if (home !== filters.team && away !== filters.team) return false;
    }

    if (filters.pick !== "all" && !matchesPickFilter(m, filters.pick, nowMs)) return false;

    return true;
  });
}

function matchesPickFilter(match: Match, pick: Exclude<PickFilter, "all">, nowMs: number): boolean {
  const isPicked = match.user_score_pick != null;
  if (pick === "picked") return isPicked;

  // pending: not picked yet, kickoff hasn't passed, and the match has both teams
  const kickoffPassed = new Date(match.kickoff_at).getTime() <= nowMs;
  const hasTeams = match.teams.home != null && match.teams.away != null;
  return !isPicked && !kickoffPassed && hasTeams;
}

// `pick` is intentionally excluded from active filter count — tabs are a view dimension, not a filter
// chip; counting it here would inflate the "active filters" badge in the bar
export function activeFilterCount(filters: ScheduleFilters): number {
  let count = 0;
  if (filters.stage !== "all") count++;
  if (filters.group !== "all") count++;
  if (filters.team !== "all") count++;
  if (filters.matchStatus !== "all") count++;
  return count;
}
