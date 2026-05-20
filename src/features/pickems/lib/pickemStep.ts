import type { PickemStep } from "../types/pickems.types";

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
