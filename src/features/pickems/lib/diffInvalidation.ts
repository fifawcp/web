import type { BracketMatchSlot } from "../types/pickems.types";

/**
 * Counts how many user-picked matches lost their pick between the previous and next
 * server bracket projections. Used to tell the user "N picks were cleared" after a
 * group-order or best-thirds change cascaded into the bracket.
 */
export function countClearedPicks(prev: BracketMatchSlot[] | undefined, next: BracketMatchSlot[]): number {
  if (!prev) return 0;
  const nextById = new Map(next.map((slot) => [slot.match_id, slot] as const));
  let cleared = 0;
  for (const slot of prev) {
    if (!slot.picked_team) continue;
    const after = nextById.get(slot.match_id);
    if (!after?.picked_team) cleared += 1;
  }
  return cleared;
}
