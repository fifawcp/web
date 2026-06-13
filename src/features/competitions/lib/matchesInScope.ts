import { computeMatchUiState } from "@/features/schedule/lib/computeMatchUiState";
import type { Match } from "@/features/schedule/types/schedule.types";

import type { Competition } from "../types/competitions.types";

import { resolveScope } from "./formatScope";
import { resolvePickMatch } from "./resolvePickMatch";

// Every match a competition scores: for `pick`, the single covered match; for
// `match`, every match whose stage is in scope and (all teams, or one side is in
// the team set). Mirrors the server's scoring scope.
export function matchesInScope(competition: Competition, matches: Match[]): Match[] {
  if (competition.type === "pick") {
    const match = resolvePickMatch(competition, matches);
    return match ? [match] : [];
  }
  if (competition.type !== "match") return [];

  const scope = resolveScope(competition);
  const stages = new Set(scope.stages);
  const teams = new Set(scope.teamCodes);
  return matches.filter((match) => {
    if (!stages.has(match.stage_code)) return false;
    if (scope.isAllTeams) return true;
    return [match.teams.home?.fifa_code, match.teams.away?.fifa_code].some((code) => code != null && teams.has(code));
  });
}

// In-scope matches that are locked (kickoff passed or finished) — i.e. revealable —
// newest kickoff first so the most recently played match leads the list.
export function revealableMatches(competition: Competition, matches: Match[], now: Date = new Date()): Match[] {
  return matchesInScope(competition, matches)
    .filter((m) => computeMatchUiState(m, now).isLocked)
    .sort((a, b) => new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime());
}
