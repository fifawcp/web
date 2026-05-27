import type { TeamStandingRow } from "../types/standings.types";

/** Points awarded for predicting a team's exact finishing position. */
const POINTS_EXACT = 3;
/** Points awarded for picking the team in the top 2 but at the wrong position. */
const POINTS_QUALIFIES_TOP_2 = 1;

/**
 * Group-stage scoring rules (mirrors `/rules`):
 *   - Exact position (1st / 2nd / 3rd / 4th)           → +3
 *   - Predicted in top 2 and finished in top 2, off    → +1
 *   - Anything else                                     →  0
 *
 * `predicted === undefined` means the user didn't lock a pick for this team,
 * which also scores 0. `row.position === 0` is the API's "unresolved" sentinel
 * and must not award points.
 */
export function pointsForRow(row: TeamStandingRow, predicted: number | undefined): number {
  if (predicted === undefined) return 0;
  if (predicted === row.position) return POINTS_EXACT;
  if (predicted <= 2 && row.position > 0 && row.position <= 2) return POINTS_QUALIFIES_TOP_2;
  return 0;
}

/** Maximum points possible in a group: every team picked at its exact position. */
export function maxGroupPoints(rowCount: number): number {
  return rowCount * POINTS_EXACT;
}
