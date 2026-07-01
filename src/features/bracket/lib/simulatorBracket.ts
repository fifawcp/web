import { projectBracket } from "@/features/pickems/lib/projectBracket";
import type { BracketDraft, BracketMatchSlot } from "@/features/pickems/types/pickems.types";
import type { Match } from "@/features/schedule/types/schedule.types";

import { buildActualBracket } from "./buildActualBracket";

/**
 * Project the bracket the simulator should render.
 *
 * The *base* is the real tournament bracket (`buildActualBracket`): R32 home/away
 * resolved from the actual draw, and every decided knockout match carrying its
 * real winner on `picked_team`. Feeding that base through `projectBracket` with
 * an **empty** draft therefore reproduces the live bracket exactly — winners flow
 * forward from the real results.
 *
 * The user's simulator `draft` holds only their *overrides* (match id →
 * fifa_code). `projectBracket` applies them on top of the real base and resolves
 * R16+ home/away forward, so flipping an early-round winner automatically
 * recomputes — and, where the matchup changed, clears — every downstream round.
 * Because the base is always re-derived from the latest `/matches`, simulated
 * rounds also update as real results arrive.
 */
export function buildSimulatorBracket(matches: Match[], draft: BracketDraft): BracketMatchSlot[] {
  return projectBracket(buildActualBracket(matches), draft);
}

/**
 * How many of the user's overrides actually diverge from the real result so far.
 * Drives the "modified" affordances (e.g. enabling Reset). A draft entry that
 * merely re-affirms the real winner — or that no longer resolves against the
 * current matchup — doesn't count.
 */
export function countSimulatorEdits(matches: Match[], draft: BracketDraft): number {
  const actual = buildActualBracket(matches);
  const actualWinnerByMatch = new Map(actual.map((slot) => [slot.match_id, slot.picked_team?.fifa_code ?? null] as const));
  const projected = buildSimulatorBracket(matches, draft);

  let edits = 0;
  for (const slot of projected) {
    const draftCode = draft[slot.match_id];
    if (draftCode === undefined) continue;
    // Override dropped during projection (matchup changed upstream) — not an edit.
    if (slot.picked_team?.fifa_code !== draftCode) continue;
    // Same as reality — not a divergence.
    if (actualWinnerByMatch.get(slot.match_id) === draftCode) continue;
    edits += 1;
  }
  return edits;
}
