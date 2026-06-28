import type { BracketMatchCompare, BracketStageCode } from "@/features/pickems/types/pickems.types";

/** Which bracket view is active. Persisted in the URL (`?view=compare`). */
export type BracketViewMode = "results" | "compare";

/** Per-match team-correctness overlay, keyed by match id. Re-exported shape. */
export type SlotComparison = BracketMatchCompare;

/** Earned vs. attainable points for a single round. */
export type BracketStagePoints = { earned: number; possible: number };

/**
 * Aggregate compare totals shown in the legend: points the user has earned so
 * far against the maximum still attainable from matches that have been decided,
 * with the per-round breakdown (e.g. "R32 → R16: 40 / 64").
 */
export type BracketCompareSummary = {
  /** Points earned for correctly predicted advancers (official per-round values). */
  earned: number;
  /** Max points earnable given the stages decided so far (the denominator). */
  possible: number;
  /** Per-round earned / possible split. */
  byStage: Map<BracketStageCode, BracketStagePoints>;
};
