import type { PickemProgress } from "../types/pickems.types";

// A pick'em is complete when every step (group standings, best thirds, knockout bracket) is filled.
export function isPickemComplete(progress: PickemProgress): boolean {
  return (
    progress.groups.completed >= progress.groups.total &&
    progress.best_thirds.completed >= progress.best_thirds.total &&
    progress.bracket.completed >= progress.bracket.total
  );
}
