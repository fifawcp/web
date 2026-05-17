import type { PickemProgress, StepProgress } from "../types/dashboard.types";

const isStepDone = (s: StepProgress): boolean => s.total > 0 && s.completed >= s.total;

// Combined groups + best-thirds + bracket completion as a 0–100 percentage.
export function getBracketProgressPercent(progress: PickemProgress): number {
  const total = progress.groups.total + progress.best_thirds.total + progress.bracket.total;
  const completed = progress.groups.completed + progress.best_thirds.completed + progress.bracket.completed;
  return total > 0 ? (completed / total) * 100 : 0;
}

// The 1-indexed pick'em step the user is currently on (groups → best thirds → bracket).
export function getCurrentBracketStep(progress: PickemProgress): number {
  if (!isStepDone(progress.groups)) return 1;
  if (!isStepDone(progress.best_thirds)) return 2;
  return 3;
}

// True only when all three pick'em stages are complete.
export function isAllPickemComplete(progress: PickemProgress): boolean {
  if (!progress) return false;
  return isStepDone(progress.groups) && isStepDone(progress.best_thirds) && isStepDone(progress.bracket);
}
