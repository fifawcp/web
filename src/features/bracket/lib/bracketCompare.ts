import { FINAL_MATCH_ID, THIRD_PLACE_MATCH_ID } from "@/features/pickems/lib/bracketStructure";
import type { BracketMatchSlot, BracketStageCode } from "@/features/pickems/types/pickems.types";

import type { BracketCompareSummary, SlotComparison } from "../types/bracket.types";

/**
 * Official knockout bracket point values (mirrors the `/rules` table). Scoring is
 * cumulative per team: a team that goes all the way scores at every round it
 * reached — e.g. a correctly-predicted champion earns R32+R16+QF+SF (4+6+8+12)
 * for reaching each round, plus the champion bonus (20) = 50, not just 20.
 *
 * R32/R16/QF/SF score "per correct team that reaches this round"; the
 * third-place match and final score the correct *winner* only.
 */
export const STAGE_POINTS: Record<BracketStageCode, number> = {
  round_of_32: 4,
  round_of_16: 6,
  quarterfinals: 8,
  semifinals: 12,
  third_place: 16,
  final: 20,
};

// Stages graded on "did this team reach the round" (both teams in the match).
const REACH_STAGES = new Set<BracketStageCode>(["round_of_32", "round_of_16", "quarterfinals", "semifinals"]);

type PredictedInfo = {
  /** Per stage, the fifa codes of teams the user predicted to reach it. */
  teamsByStage: Map<BracketStageCode, Set<string>>;
  /** The user's predicted champion (Final winner). */
  championCode: string | null;
  /** The user's predicted third-place match winner. */
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

/** Did the user predict `code` to reach (or, for final/third, win) this stage? */
function userPredicted(stage: BracketStageCode, code: string | undefined, info: PredictedInfo): boolean {
  if (!code) return false;
  if (REACH_STAGES.has(stage)) return info.teamsByStage.get(stage)?.has(code) ?? false;
  if (stage === "final") return code === info.championCode;
  if (stage === "third_place") return code === info.thirdWinnerCode;
  return false;
}

/**
 * Compare overlay for the **actual** bracket: green-check each real team that
 * the user correctly predicted to reach this match's stage. For the final and
 * third-place match only the actual winner row can light up (those score the
 * winner, not participation).
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

/**
 * Aggregate earned vs. attainable points, computed against what's actually been
 * decided. Cumulative by construction: each reach-stage is scored independently,
 * so a team that advanced far contributes at every round it reached.
 */
export function summarizeBracket(actual: BracketMatchSlot[], predicted: BracketMatchSlot[]): BracketCompareSummary {
  const info = buildPredictedInfo(predicted);
  let earned = 0;
  let possible = 0;

  for (const stage of REACH_STAGES) {
    const predictedTeams = info.teamsByStage.get(stage);
    const points = STAGE_POINTS[stage];
    let actualCount = 0;
    let correct = 0;

    for (const slot of actual) {
      if (slot.stage_code !== stage) continue;
      for (const team of [slot.home_team, slot.away_team]) {
        if (!team) continue;
        actualCount += 1;
        if (predictedTeams?.has(team.fifa_code)) correct += 1;
      }
    }

    if (actualCount === 0) continue; // stage not decided yet
    earned += correct * points;
    possible += actualCount * points; // max attainable = teams that actually reached
  }

  const actualChampion = actual.find((s) => s.match_id === FINAL_MATCH_ID)?.picked_team?.fifa_code ?? null;
  if (actualChampion) {
    possible += STAGE_POINTS.final;
    if (info.championCode === actualChampion) earned += STAGE_POINTS.final;
  }
  const actualThird = actual.find((s) => s.match_id === THIRD_PLACE_MATCH_ID)?.picked_team?.fifa_code ?? null;
  if (actualThird) {
    possible += STAGE_POINTS.third_place;
    if (info.thirdWinnerCode === actualThird) earned += STAGE_POINTS.third_place;
  }

  return { earned, possible };
}
