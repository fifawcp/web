import type { GroupCode } from "@/features/schedule/types/schedule.types";

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
 * Group the flat standings rows by group_code, sort by position, and derive
 * the per-group matchday + per-row qualification status.
 */
export function groupAndEnrichStandings(rows: StandingRow[]): GroupStandings[] {
  const byGroup = new Map<GroupCode, TeamStandingRow[]>();

  for (const raw of rows ?? []) {
    const groupCode = raw.team.group_code as GroupCode | null;
    if (!groupCode) continue;
    const enriched: TeamStandingRow = {
      ...raw,
      qualification_status: deriveQualification(raw.position),
    };
    const arr = byGroup.get(groupCode);
    if (arr) arr.push(enriched);
    else byGroup.set(groupCode, [enriched]);
  }

  const groups: GroupStandings[] = [];
  for (const [group_code, rows] of byGroup) {
    rows.sort((a, b) => a.position - b.position);
    const matchday = rows.reduce((m, r) => Math.max(m, r.matches_played), 0);
    groups.push({ group_code, matchday, total_matchdays: TOTAL_MATCHDAYS, rows });
  }
  groups.sort((a, b) => a.group_code.localeCompare(b.group_code));
  return groups;
}
