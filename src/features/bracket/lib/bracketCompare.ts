import { FINAL_MATCH_ID, THIRD_PLACE_MATCH_ID } from "@/features/pickems/lib/bracketStructure";
import type { BracketMatchSlot, BracketStageCode } from "@/features/pickems/types/pickems.types";

import type { BracketCompareSummary, SlotComparison } from "../types/bracket.types";

/**
 * Official knockout bracket point values (mirrors the `/rules` table). Points are
 * earned by **advancing past** a round, not by reaching it: winning a Round-of-32
 * match earns its 4, winning the Round-of-16 earns 6, and so on. A correctly
 * predicted champion wins R32+R16+QF+SF+Final = 4+6+8+12+20 = 50.
 *
 * Reaching the Round of 32 is the group stage's job (qualifier points), so it is
 * not bracket-scored — but the bracket still *highlights* a correctly predicted
 * R32 team (see `buildComparisonMap`) to show the group call was right.
 */
export const STAGE_POINTS: Record<BracketStageCode, number> = {
  round_of_32: 4,
  round_of_16: 6,
  quarterfinals: 8,
  semifinals: 12,
  third_place: 16,
  final: 20,
};

// Rounds whose green check means "this team reached the round" (both sides of the
// match light up). The final / third-place match light up the winner only.
const REACH_STAGES = new Set<BracketStageCode>(["round_of_32", "round_of_16", "quarterfinals", "semifinals"]);

type PredictedInfo = {
  /** Per stage, the fifa codes of teams predicted to reach it. */
  teamsByStage: Map<BracketStageCode, Set<string>>;
  /** Predicted champion (Final winner) and third-place-match winner. */
  championCode: string | null;
  thirdWinnerCode: string | null;
};

function buildPredictedInfo(predicted: BracketMatchSlot[]): PredictedInfo {
  const teamsByStage = new Map<BracketStageCode, Set<string>>();
  let championCode: string | null = null;
  let thirdWinnerCode: string | null = null;

  for (const slot of predicted) {
    const set = teamsByStage.get(slot.stage_code) ?? new Set<string>();
    if (slot.home_team) set.add(slot.home_team.fifa_code);
    if (slot.away_team) set.add(slot.away_team.fifa_code);
    teamsByStage.set(slot.stage_code, set);

    if (slot.match_id === FINAL_MATCH_ID) championCode = slot.picked_team?.fifa_code ?? null;
    if (slot.match_id === THIRD_PLACE_MATCH_ID) thirdWinnerCode = slot.picked_team?.fifa_code ?? null;
  }

  return { teamsByStage, championCode, thirdWinnerCode };
}

/** Did the prediction place `code` in (or, for final/third, win) this stage? */
function userPredicted(stage: BracketStageCode, code: string | undefined, info: PredictedInfo): boolean {
  if (!code) return false;
  if (REACH_STAGES.has(stage)) return info.teamsByStage.get(stage)?.has(code) ?? false;
  if (stage === "final") return code === info.championCode;
  if (stage === "third_place") return code === info.thirdWinnerCode;
  return false;
}

/**
 * Compare overlay for the **actual** bracket: green-check each real team the user
 * correctly predicted to *reach* this match's stage — including the Round of 32,
 * which confirms the group call even though it earns no bracket points. The final
 * and third-place match light up only the actual winner row.
 */
export function buildComparisonMap(actual: BracketMatchSlot[], predicted: BracketMatchSlot[]): Map<number, SlotComparison> {
  const info = buildPredictedInfo(predicted);
  const map = new Map<number, SlotComparison>();

  for (const slot of actual) {
    const stage = slot.stage_code;
    let homeCorrect: boolean;
    let awayCorrect: boolean;

    if (REACH_STAGES.has(stage)) {
      homeCorrect = userPredicted(stage, slot.home_team?.fifa_code, info);
      awayCorrect = userPredicted(stage, slot.away_team?.fifa_code, info);
    } else {
      // Final / third place: only the actual winner row can be a correct guess.
      const winnerCode = slot.picked_team?.fifa_code;
      const hit = userPredicted(stage, winnerCode, info);
      homeCorrect = hit && slot.home_team?.fifa_code === winnerCode;
      awayCorrect = hit && slot.away_team?.fifa_code === winnerCode;
    }

    map.set(slot.match_id, { homeCorrect, awayCorrect });
  }

  return map;
}

/** Per stage, the fifa codes of the teams that won their match at that stage. */
function winnersByStage(slots: BracketMatchSlot[]): Map<BracketStageCode, Set<string>> {
  const map = new Map<BracketStageCode, Set<string>>();
  for (const slot of slots) {
    const winner = slot.picked_team?.fifa_code;
    if (!winner) continue;
    const set = map.get(slot.stage_code) ?? new Set<string>();
    set.add(winner);
    map.set(slot.stage_code, set);
  }
  return map;
}

/**
 * Aggregate earned vs. attainable points, against what's actually been decided.
 * Points are for *advancing*: each decided match is worth its round's value to
 * whoever wins it, and the user earns it when their predicted winner is the real
 * one. Reaching the R32 is not counted here (it's group-stage scoring).
 */
export function summarizeBracket(actual: BracketMatchSlot[], predicted: BracketMatchSlot[]): BracketCompareSummary {
  const predictedWinners = winnersByStage(predicted);
  const byStage = new Map<BracketStageCode, { earned: number; possible: number }>();
  let earned = 0;
  let possible = 0;

  for (const slot of actual) {
    const winnerCode = slot.picked_team?.fifa_code;
    if (!winnerCode) continue; // match not decided yet
    const points = STAGE_POINTS[slot.stage_code];
    const stat = byStage.get(slot.stage_code) ?? { earned: 0, possible: 0 };
    stat.possible += points;
    possible += points;
    if (predictedWinners.get(slot.stage_code)?.has(winnerCode)) {
      stat.earned += points;
      earned += points;
    }
    byStage.set(slot.stage_code, stat);
  }

  return { earned, possible, byStage };
}
