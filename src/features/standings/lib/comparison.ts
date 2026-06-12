import type { UserPickem } from "@/features/pickems/types/pickems.types";

import type {
  GroupComparison,
  GroupStandings,
  PickAccuracy,
  PickIndex,
  RowComparison,
  TeamStandingRow,
  ThirdPlaceAccuracy,
  ThirdPlaceComparison,
  ThirdPlaceRow,
  ThirdPlaceSummary,
} from "../types/standings.types";

import { maxGroupPoints, pointsForRow } from "./scoring";

/**
 * Build a 2-level lookup: group_code -> fifa_code -> predicted position.
 * Reads the pickem owned by the `pickems` feature so standings never needs
 * its own pickem shape.
 *
 * Unlocked groups are skipped — an unlocked pick is the pickem feature's
 * "not committed yet" state, so we treat it the same as no pick at all.
 */
export function buildPickIndex(pickem: UserPickem | null): PickIndex {
  const index: PickIndex = new Map();
  if (!pickem?.group_picks) return index;
  for (const group of pickem.group_picks) {
    if (!group.locked) continue;
    const teamMap = new Map<string, number>();
    for (const team of group.teams) teamMap.set(team.fifa_code, team.position);
    index.set(group.group_code, teamMap);
  }
  return index;
}

/** Set of FIFA codes the user picked as their eight best third-placed teams. */
export function buildBestThirdsSet(pickem: UserPickem | null): Set<string> {
  return new Set((pickem?.best_thirds ?? []).map((team) => team.fifa_code));
}

/**
 * Classify a pick based on points earned (scoring-based, not proximity-based):
 * - `exact_3pts`: Exact position → +3 points
 * - `top2_1pt`: Both predicted and actual are in top 2, but wrong order → +1 point
 * - `wrong_0pts`: Any other case → 0 points
 */
function classifyByScoring(predicted: number, actual: number): PickAccuracy {
  if (predicted === actual) return "exact_3pts";
  if (predicted <= 2 && actual > 0 && actual <= 2) return "top2_1pt";
  return "wrong_0pts";
}

export function computeRowComparison(row: TeamStandingRow, groupPicks: Map<string, number> | null | undefined): RowComparison {
  const predicted = groupPicks?.get(row.team.fifa_code) ?? null;
  if (predicted == null) {
    return { predicted_position: null, accuracy: "not_picked" };
  }
  return { predicted_position: predicted, accuracy: classifyByScoring(predicted, row.position) };
}

export function computeGroupComparison(rows: TeamStandingRow[], groupPicks: Map<string, number> | null | undefined): GroupComparison {
  const total = rows.length;
  const maxPoints = maxGroupPoints(total);
  if (!groupPicks || groupPicks.size === 0) {
    return { correct: 0, total, isPerfect: false, points: 0, maxPoints };
  }
  let correct = 0;
  let points = 0;
  for (const row of rows) {
    const predicted = groupPicks.get(row.team.fifa_code);
    if (predicted === row.position) correct += 1;
    points += pointsForRow(row, predicted);
  }
  return { correct, total, isPerfect: correct === total, points, maxPoints };
}

/**
 * Aggregate points across the whole group stage: earned (sum of each group's
 * scored points) over possible (sum of every group's max). Unpicked/unlocked
 * groups contribute 0 earned but their full max to possible, so the figure
 * always reads against the total achievable — matching the bracket's tally.
 */
export function summarizeGroupStage(groups: GroupStandings[], pickIndex: PickIndex | null): { earned: number; possible: number } {
  let earned = 0;
  let possible = 0;
  for (const group of groups) {
    const comparison = computeGroupComparison(group.rows, pickIndex?.get(group.group_code));
    earned += comparison.points;
    possible += comparison.maxPoints;
  }
  return { earned, possible };
}

/** Tailwind classes for the small pill rendering the user's predicted position. */
export function getAccuracyPillClass(accuracy: PickAccuracy): string {
  switch (accuracy) {
    case "exact_3pts":
      return "bg-lime-500/15 border-lime-500/30 text-lime-700 dark:text-lime-400";
    case "top2_1pt":
      return "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400";
    case "wrong_0pts":
      return "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400";
    case "not_picked":
    default:
      return "bg-muted border-border text-muted-foreground";
  }
}

// Third-place comparison ------------------------------------------------------

/**
 * Compare a third-placed team against the user's best-thirds picks:
 * - `correct`    — picked, and the team advances
 * - `wrong`      — picked, but the team misses the cut
 * - `missed`     — not picked, yet the team advances
 * - `not_picked` — not picked and the team misses (neutral)
 */
export function computeThirdPlaceComparison(row: ThirdPlaceRow, bestThirds: Set<string> | null): ThirdPlaceComparison {
  if (!bestThirds) return { picked: false, accuracy: "not_picked" };
  const picked = bestThirds.has(row.team.fifa_code);
  if (picked) return { picked, accuracy: row.advances ? "correct" : "wrong" };
  return { picked, accuracy: row.advances ? "missed" : "not_picked" };
}

/**
 * Count how many of the user's best-thirds picks actually advance.
 * Scoring: +2 points per correct pick, max 16 (8 teams × 2).
 *
 * Returns `ThirdPlaceSummary`, not `GroupComparison` — same shape, different
 * semantics. Keeping them as separate types prevents a future field added
 * to one from silently changing the contract of the other.
 */
export function computeThirdPlaceAccuracy(rows: ThirdPlaceRow[], bestThirds: Set<string> | null): ThirdPlaceSummary {
  if (!bestThirds || bestThirds.size === 0) {
    return { correct: 0, total: 0, isPerfect: false, points: 0, maxPoints: 0 };
  }
  let correct = 0;
  for (const row of rows) {
    if (bestThirds.has(row.team.fifa_code) && row.advances) correct += 1;
  }
  const points = correct * 2;
  const maxPoints = bestThirds.size * 2;
  return { correct, total: bestThirds.size, isPerfect: correct === bestThirds.size, points, maxPoints };
}

/**
 * Tailwind classes for the small pill in the third-place "You" column.
 * - `correct`: green — picked and advanced
 * - `wrong`: red — picked but didn't advance
 * - `missed` / `not_picked`: muted — not picked (neutral, not an error)
 */
export function getThirdPlacePillClass(accuracy: ThirdPlaceAccuracy): string {
  switch (accuracy) {
    case "correct":
      return "bg-lime-500/15 border-lime-500/30 text-lime-700 dark:text-lime-400";
    case "wrong":
      return "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400";
    case "missed":
    case "not_picked":
    default:
      return "bg-muted border-border text-muted-foreground";
  }
}
