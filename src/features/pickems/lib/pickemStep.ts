import type { PickemStep, UserPickem } from "../types/pickems.types";

export const PICKEM_STEPS: readonly PickemStep[] = ["groups", "thirds", "bracket"];

export const DEFAULT_STEP: PickemStep = "groups";

export function parseStep(value: string | null | undefined): PickemStep {
  return (PICKEM_STEPS as readonly string[]).includes(value ?? "") ? (value as PickemStep) : DEFAULT_STEP;
}

export function stepIndex(step: PickemStep): number {
  return PICKEM_STEPS.indexOf(step);
}

export function prevStep(step: PickemStep): PickemStep | null {
  const i = stepIndex(step);
  return i > 0 ? PICKEM_STEPS[i - 1] : null;
}

/**
 * Returns the furthest step reachable given the server-committed pickem state
 * (no local draft overlay). Used on load to detect when the URL step is ahead
 * of what the server data actually supports — e.g. the user completed and
 * submitted on mobile while this device still has `?step=bracket` in the URL.
 */
export function highestValidStep(data: UserPickem): PickemStep {
  if (data.is_locked) return "bracket";
  const groupsDone = data.group_picks.length > 0 && data.group_picks.every((g) => g.locked);
  if (!groupsDone) return "groups";
  if (data.best_thirds.length < 8) return "thirds";
  return "bracket";
}
