import { getOutcome, isCorrectOutcome, isCorrectScore, type Outcome } from "@/features/schedule/lib/scoring";
import type { MatchResult, UserScorePick } from "@/features/schedule/types/schedule.types";
import { MATCH_SCORE_EXACT, MATCH_SCORE_OUTCOME } from "@/shared/lib/scoring/matchScoring";

import type { MemberMatchPick } from "../types/predictions.types";

// exact: predicted the exact score · winner: right outcome, wrong score ·
// miss: wrong outcome · none: no prediction · pending: locked but no result yet.
export type PickCategory = "exact" | "winner" | "miss" | "none" | "pending";

export type MemberPickRow = {
  member: MemberMatchPick["member"];
  pick: UserScorePick | null;
  category: PickCategory;
  points: number;
};

export type MatchBreakdown = {
  // Members who made a prediction — the denominator for the distribution.
  total: number;
  correctWinners: number;
  exactScores: number;
  distribution: Record<Outcome, number>;
  finished: boolean;
  rows: MemberPickRow[];
};

// Classifies a single prediction against a result. `null` result → `pending`
// (locked but unscored); `null` pick → `none`.
export function categorizePick(pick: UserScorePick | null, result: MatchResult | null): PickCategory {
  if (!pick) return "none";
  if (!result) return "pending";
  if (isCorrectScore(pick, result)) return "exact";
  if (isCorrectOutcome(pick, result)) return "winner";
  return "miss";
}

export function pointsFor(category: PickCategory): number {
  if (category === "exact") return MATCH_SCORE_EXACT;
  if (category === "winner") return MATCH_SCORE_OUTCOME;
  return 0;
}

// Aggregates a match's member picks against the result. Pure — `result == null`
// (locked, not finished) yields `pending` rows with no accuracy, mirroring the API
// which reveals picks at kickoff but only scores them once the match finishes.
export function computeMatchBreakdown(picks: MemberMatchPick[], result: MatchResult | null): MatchBreakdown {
  const rows: MemberPickRow[] = picks.map(({ member, pick }) => {
    const category = categorizePick(pick, result);
    return { member, pick, category, points: pointsFor(category) };
  });

  const predictions = rows.filter((row): row is MemberPickRow & { pick: UserScorePick } => row.pick != null);
  const total = predictions.length;
  const exactScores = rows.filter((row) => row.category === "exact").length;
  const correctWinners = rows.filter((row) => row.category === "exact" || row.category === "winner").length;

  const distribution: Record<Outcome, number> = { home: 0, draw: 0, away: 0 };
  for (const row of predictions) distribution[getOutcome(row.pick)] += 1;

  return {
    total,
    correctWinners,
    exactScores,
    distribution,
    finished: result != null,
    rows,
  };
}
