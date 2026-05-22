import type { GroupComparison, PickAccuracy, PickemState, PickIndex, RowComparison, TeamStandingRow } from "../types/standings.types";

/** Build a 2-level lookup: group_code -> fifa_code -> predicted position. */
export function buildPickIndex(state: PickemState | null): PickIndex {
  const index: PickIndex = new Map();
  if (!state?.group_picks) return index;
  for (const gp of state.group_picks) {
    const teamMap = new Map<string, number>();
    for (const t of gp.teams) teamMap.set(t.fifa_code, t.position);
    index.set(gp.group_code, teamMap);
  }
  return index;
}

function classify(delta: number): PickAccuracy {
  const abs = Math.abs(delta);
  if (abs === 0) return "exact";
  if (abs === 1) return "off_by_1";
  return "off_by_2_plus";
}

export function computeRowComparison(row: TeamStandingRow, groupPicks: Map<string, number> | null | undefined): RowComparison {
  const predicted = groupPicks?.get(row.team.fifa_code) ?? null;
  if (predicted == null) {
    return { predicted_position: null, delta: null, accuracy: "not_picked" };
  }
  const delta = predicted - row.position;
  return { predicted_position: predicted, delta, accuracy: classify(delta) };
}

export function computeGroupComparison(rows: TeamStandingRow[], groupPicks: Map<string, number> | null | undefined): GroupComparison {
  if (!groupPicks || groupPicks.size === 0) {
    return { correct: 0, total: rows.length, isPerfect: false };
  }
  let correct = 0;
  for (const row of rows) {
    const predicted = groupPicks.get(row.team.fifa_code);
    if (predicted === row.position) correct += 1;
  }
  return { correct, total: rows.length, isPerfect: correct === rows.length };
}

/** Tailwind classes for the small pill rendering the user's predicted position. */
export function getAccuracyPillClass(accuracy: PickAccuracy): string {
  switch (accuracy) {
    case "exact":
      return "bg-lime-500/15 border-lime-500/30 text-lime-700 dark:text-lime-400";
    case "off_by_1":
      return "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400";
    case "off_by_2_plus":
      return "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400";
    case "not_picked":
    default:
      return "bg-muted border-border text-muted-foreground";
  }
}
