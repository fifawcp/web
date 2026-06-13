import type { BracketMatchCompare } from "@/features/pickems/types/pickems.types";

/** Which bracket view is active. Persisted in the URL (`?view=compare`). */
export type BracketViewMode = "results" | "compare";

/** Per-match team-correctness overlay, keyed by match id. Re-exported shape. */
export type SlotComparison = BracketMatchCompare;

/**
 * Aggregate compare totals shown in the legend: points the user has earned so
 * far against the maximum still attainable from matches that have been decided.
 */
export type BracketCompareSummary = {
  /** Points earned for correctly predicted advancers (official per-round values). */
  earned: number;
  /** Max points earnable given the stages decided so far (the denominator). */
  possible: number;
};
