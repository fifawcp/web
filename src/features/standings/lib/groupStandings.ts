import type { GroupCode } from "@/shared/types/wcp.types";

import type { GroupStandings, QualificationStatus, StandingRow, TeamStandingRow } from "../types/standings.types";

/** World Cup group stage is always 3 matchdays per group. */
const TOTAL_MATCHDAYS = 3;

/**
 * Derive a row's qualification status from its position. Positions 1-2 advance
 * directly to R32; position 3 is provisionally eligible for the best-third
 * playoff; position 4 is eliminated.
 */
function deriveQualification(position: number): QualificationStatus {
  if (position <= 2) return "advances_to_r32";
  if (position === 3) return "best_third_playoff";
  return "eliminated";
}

/**
 * Order teams the way a group table is read: points, goal difference, goals
 * scored, then the fair-play score, with the FIFA code as a deterministic
 * final tiebreaker so the result is stable run to run.
 */
export function compareStanding(a: StandingRow, b: StandingRow): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
  if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
  const fairPlay = (b.fair_play_score ?? 0) - (a.fair_play_score ?? 0);
  if (fairPlay !== 0) return fairPlay;
  return a.team.fifa_code.localeCompare(b.team.fifa_code);
}

/**
 * Group the flat standings rows by group_code, order each table, and derive
 * the per-group matchday + per-row qualification status.
 *
 * The backend's `position` is trusted when present (it encodes head-to-head
 * tiebreakers we can't recompute from aggregate stats). Before kickoff it
 * returns `0` for every team, so we fall back to ordering by raw stats — that
 * keeps the group tables and the third-place ranking populated pre-tournament.
 */
export function groupAndEnrichStandings(rows: StandingRow[]): GroupStandings[] {
  const byGroup = new Map<GroupCode, StandingRow[]>();

  for (const raw of rows ?? []) {
    const groupCode = raw.team.group_code as GroupCode | null;
    if (!groupCode) continue;
    const arr = byGroup.get(groupCode);
    if (arr) arr.push(raw);
    else byGroup.set(groupCode, [raw]);
  }

  const groups: GroupStandings[] = [];
  for (const [group_code, groupRows] of byGroup) {
    const hasPositions = groupRows.some((row) => row.position > 0);
    const ordered = hasPositions ? [...groupRows].sort((a, b) => a.position - b.position) : [...groupRows].sort(compareStanding);

    const enriched: TeamStandingRow[] = ordered.map((row, index) => {
      const position = hasPositions ? row.position : index + 1;
      return { ...row, position, qualification_status: deriveQualification(position) };
    });

    const matchday = enriched.reduce((m, r) => Math.max(m, r.matches_played), 0);
    groups.push({ group_code, matchday, total_matchdays: TOTAL_MATCHDAYS, rows: enriched });
  }

  groups.sort((a, b) => a.group_code.localeCompare(b.group_code));
  return groups;
}
