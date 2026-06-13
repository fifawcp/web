import type { BracketStageCode } from "../types/pickems.types";

// Match IDs by stage (numerical / API order)
export const R32_MATCH_IDS = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88] as const;
export const R16_MATCH_IDS = [89, 90, 91, 92, 93, 94, 95, 96] as const;
export const QF_MATCH_IDS = [97, 98, 99, 100] as const;
export const SF_MATCH_IDS = [101, 102] as const;
export const THIRD_PLACE_MATCH_ID = 103 as const;
export const FINAL_MATCH_ID = 104 as const;

/**
 * Group-position placeholders for each Round-of-32 slot, per the official 2026
 * bracket (e.g. M74 = winner of Group E vs a third-placed team from A/B/C/D/F).
 * Used as read-only labels before the qualifiers are known. `home`/`away` follow
 * the bracket's top/bottom order (the same order as `R32_VISUAL_ORDER`).
 */
export const R32_SLOT_LABELS: Record<number, { home: string; away: string }> = {
  73: { home: "2A", away: "2B" },
  74: { home: "1E", away: "3A/B/C/D/F" },
  75: { home: "1F", away: "2C" },
  76: { home: "1C", away: "2F" },
  77: { home: "1I", away: "3C/D/F/G/H" },
  78: { home: "2E", away: "2I" },
  79: { home: "1A", away: "3C/E/F/H/I" },
  80: { home: "1L", away: "3E/H/I/J/K" },
  81: { home: "1D", away: "3B/E/F/I/J" },
  82: { home: "1G", away: "3A/E/H/I/J" },
  83: { home: "2K", away: "2L" },
  84: { home: "1H", away: "2J" },
  85: { home: "1B", away: "3E/F/G/I/J" },
  86: { home: "1J", away: "2H" },
  87: { home: "1K", away: "3D/E/I/J/L" },
  88: { home: "2D", away: "2G" },
};

/**
 * Bracket-adjacency order — matches printed top-to-bottom in the
 * official 2026 WC bracket image. Each `_VISUAL_ORDER` chunked by 2 yields
 * the bracket pairs (74 plays 77 in the same R16 cell, etc.).
 */
export const R32_VISUAL_ORDER = [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87] as const;
export const R16_VISUAL_ORDER = [89, 90, 93, 94, 91, 92, 95, 96] as const;
export const QF_VISUAL_ORDER = [97, 98, 99, 100] as const;
export const SF_VISUAL_ORDER = [101, 102] as const;

/**
 * Split halves of the bracket — used by the xl+ desktop layout where the tree
 * folds around a center column (Final + Third Place). Each side's R32 row
 * order is the first / second half of `R32_VISUAL_ORDER`; R16+ follows the
 * feeder map so SF(L) = 101 (winners of 97 & 98 from the left arm) and
 * SF(R) = 102 (right arm).
 */
export const R32_LEFT_ORDER = [74, 77, 73, 75, 83, 84, 81, 82] as const;
export const R32_RIGHT_ORDER = [76, 78, 79, 80, 86, 88, 85, 87] as const;
export const R16_LEFT_ORDER = [89, 90, 93, 94] as const;
export const R16_RIGHT_ORDER = [91, 92, 95, 96] as const;
export const QF_LEFT_ORDER = [97, 98] as const;
export const QF_RIGHT_ORDER = [99, 100] as const;
export const SF_LEFT_ORDER = [101] as const;
export const SF_RIGHT_ORDER = [102] as const;

// The 32 picks the backend's PUT /api/pickems/bracket expects — includes the
// third-place match (losers of SF 101 and SF 102 face off for +80 pts).
export const PICKABLE_MATCH_IDS = [...R32_MATCH_IDS, ...R16_MATCH_IDS, ...QF_MATCH_IDS, ...SF_MATCH_IDS, THIRD_PLACE_MATCH_ID, FINAL_MATCH_ID] as const;

export const TOTAL_BRACKET_PICKS = PICKABLE_MATCH_IDS.length;

export const STAGES: BracketStageCode[] = ["round_of_32", "round_of_16", "quarterfinals", "semifinals", "third_place", "final"];

export const STAGE_MATCH_IDS: Record<BracketStageCode, readonly number[]> = {
  round_of_32: R32_MATCH_IDS,
  round_of_16: R16_MATCH_IDS,
  quarterfinals: QF_MATCH_IDS,
  semifinals: SF_MATCH_IDS,
  third_place: [THIRD_PLACE_MATCH_ID],
  final: [FINAL_MATCH_ID],
};

// Mirrors the backend's `MatchSlotRules` for `SourceWinner` references. Each
// R16+ match (except the third-place match) gets its home/away from the picked
// winners of the listed feeder matches.
export const BRACKET_FEEDERS: Record<number, { home: number; away: number }> = {
  // Round of 16
  89: { home: 74, away: 77 },
  90: { home: 73, away: 75 },
  91: { home: 76, away: 78 },
  92: { home: 79, away: 80 },
  93: { home: 83, away: 84 },
  94: { home: 81, away: 82 },
  95: { home: 86, away: 88 },
  96: { home: 85, away: 87 },
  // Quarterfinals
  97: { home: 89, away: 90 },
  98: { home: 93, away: 94 },
  99: { home: 91, away: 92 },
  100: { home: 95, away: 96 },
  // Semifinals
  101: { home: 97, away: 98 },
  102: { home: 99, away: 100 },
  // Final
  104: { home: 101, away: 102 },
};

// The third-place match (103) is unique: home/away are the *losers* of the
// two SF matches, not the winners.
export const BRACKET_LOSER_FEEDERS: Record<number, { home: number; away: number }> = {
  103: { home: 101, away: 102 },
};
