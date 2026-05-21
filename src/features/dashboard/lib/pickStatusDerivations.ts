import type { PickemProgress, StepProgress } from "../types/dashboard.types";

const isStepDone = (s: StepProgress): boolean => s.total > 0 && s.completed >= s.total;

// How many of the three pick'em stages are fully done. A stage counts only
// when its `completed === total` — partial picks don't move the needle.
export function getBracketCompletedStages(progress: PickemProgress): number {
  return [progress.groups, progress.best_thirds, progress.bracket].filter(isStepDone).length;
}

// Bracket progress as a 0/33/66/100 step-based percentage so the bar mirrors
// the completed-stage count rather than raw item totals.
export function getBracketProgressPercent(progress: PickemProgress): number {
  return (getBracketCompletedStages(progress) / 3) * 100;
}

// True only when all three pick'em stages are complete.
export function isAllPickemComplete(progress: PickemProgress): boolean {
  if (!progress) return false;
  return isStepDone(progress.groups) && isStepDone(progress.best_thirds) && isStepDone(progress.bracket);
}
