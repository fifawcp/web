import { buildComparisonMap } from "@/features/bracket/lib/bracketCompare";
import type { SlotComparison } from "@/features/bracket/types/bracket.types";
import type { BracketMatchSlot, ResolvedGroupPick } from "@/features/pickems/types/pickems.types";
import { computeGroupComparison, computeRowComparison, computeThirdPlaceComparison } from "@/features/standings/lib/comparison";
import { groupAndEnrichStandings } from "@/features/standings/lib/groupStandings";
import { buildThirdPlaceStandings } from "@/features/standings/lib/thirdPlace";
import type { PickAccuracy, ThirdPlaceAccuracy, StandingRow } from "@/features/standings/types/standings.types";
import type { GroupCode, Team } from "@/shared/types/wcp.types";

// Empty pick map for groups the member never locked: every row then resolves to
// "not picked" (the "—" circle), so a member who made no pick'em scores nothing —
// exactly how `/standings` compare treats an unlocked group.
const NO_PICKS: Map<string, number> = new Map();

// One graded row in a decided group — the actual finishing team, plus where the
// member predicted it (`predictedPosition`) and how that scored (`accuracy`).
// Mirrors the standings compare row: rows sit in actual order, the member's pick
// shows as an accuracy-coloured position circle.
export type GroupRevealRow = {
  team: Team;
  actualPosition: number;
  predictedPosition: number | null;
  accuracy: PickAccuracy;
};

// Per-group compare summary shown in the (collapsed) card header — how many
// positions the member nailed and the points they earned (with the group's max),
// like `/standings`. `maxPoints` lets the section total an earned / possible tally.
export type GroupSummary = { correct: number; total: number; points: number; maxPoints: number };

export type GroupRevealData = { decided: boolean; rows: GroupRevealRow[]; summary: GroupSummary | null };

export type GroupReveal = Map<GroupCode, GroupRevealData>;

/**
 * Score a member's group-stage order against the actual standings. A group is
 * `decided` only once it has played all its matchdays — until then the table is
 * provisional, so we leave it un-graded (the card falls back to the member's
 * predicted order). When decided, rows come back in *actual* order so the
 * predicted-position circle reads against the final table.
 *
 * `scored` is the authoritative gate: the board's leaderboard is the source of
 * truth for points, and the member endpoint hands back a fully-seeded, locked
 * pickem even for members who never really played. When the board credited the
 * member no group points we treat every pick as "not picked" → "—", so the reveal
 * never shows points the board didn't actually award.
 */
export function buildGroupReveal(groupPicks: ResolvedGroupPick[], standings: StandingRow[], scored: boolean): GroupReveal {
  const reveal: GroupReveal = new Map();
  const enriched = groupAndEnrichStandings(standings);
  const byGroupActual = new Map(enriched.map((g) => [g.group_code, g] as const));

  for (const pick of groupPicks) {
    const actualGroup = byGroupActual.get(pick.group_code);
    // Only grade a *finished* group — provisional positions would show points that
    // shift as the group plays out and wouldn't reconcile with the board total.
    const decided = actualGroup ? actualGroup.matchday >= actualGroup.total_matchdays : false;

    if (!actualGroup || !decided) {
      reveal.set(pick.group_code, { decided: false, rows: [], summary: null });
      continue;
    }

    const pickMap = scored && pick.locked ? new Map(pick.teams.map((t) => [t.fifa_code, t.position])) : NO_PICKS;
    const rows: GroupRevealRow[] = actualGroup.rows.map((row) => {
      const { predicted_position, accuracy } = computeRowComparison(row, pickMap);
      return { team: row.team, actualPosition: row.position, predictedPosition: predicted_position, accuracy };
    });

    // Only summarise a group the member actually scored — a non-scorer's header
    // stays clean (no "0 pts" badge) since their picks read as "—".
    const c = pickMap.size > 0 ? computeGroupComparison(actualGroup.rows, pickMap) : null;
    const summary = c ? { correct: c.correct, total: c.total, points: c.points, maxPoints: c.maxPoints } : null;

    reveal.set(pick.group_code, { decided: true, rows, summary });
  }

  return reveal;
}

// One row of the cross-group third-place ranking, graded against the member's
// best-thirds picks: `accuracy` drives the same ✓ / ✕ / — circle as standings.
export type ThirdRevealRow = {
  team: Team;
  rank: number;
  advances: boolean;
  picked: boolean;
  accuracy: ThirdPlaceAccuracy;
};

export type ThirdsReveal = { decided: boolean; rows: ThirdRevealRow[]; qualifyingSlots: number };

/**
 * Rank the twelve third-placed teams and grade them against the member's
 * best-thirds picks. Only meaningful once the whole group stage has finished (the
 * cross-group ranking is provisional until then), so `decided` gates on every
 * group having played all its matchdays. `scored` is the same authoritative gate
 * as `buildGroupReveal`: when the board credited the member no best-third points,
 * every row resolves to "not picked" (`—`).
 */
export function buildThirdsReveal(bestThirds: Team[], standings: StandingRow[], scored: boolean): ThirdsReveal {
  const enriched = groupAndEnrichStandings(standings);
  const decided = enriched.length > 0 && enriched.every((g) => g.matchday >= g.total_matchdays);
  const third = buildThirdPlaceStandings(enriched);
  const pickedSet = scored ? new Set(bestThirds.map((team) => team.fifa_code)) : new Set<string>();

  const rows: ThirdRevealRow[] = third.rows.map((row) => {
    const { picked, accuracy } = computeThirdPlaceComparison(row, pickedSet);
    return { team: row.team, rank: row.third_place_rank, advances: row.advances, picked, accuracy };
  });

  return { decided, rows, qualifyingSlots: third.qualifying_slots };
}

/**
 * Grade the member's *predicted* bracket against reality, keyed by predicted match
 * id, so the reveal greens the teams they correctly predicted to reach each round
 * — including the Round of 32 (a correct group call) even though that scores no
 * bracket points. `buildComparisonMap` on the member's own tree does exactly this.
 *
 * `participated` is the gate: the seeded member endpoint hands back a default tree
 * even for non-players, so we only light it up once the member has earned points
 * somewhere. The all-false map keeps the cards in compare mode (their picks shown,
 * but no checks and no pick accent).
 */
export function buildBracketReveal(predicted: BracketMatchSlot[], actual: BracketMatchSlot[], participated: boolean): Map<number, SlotComparison> {
  if (!participated) return new Map(predicted.map((slot) => [slot.match_id, { homeCorrect: false, awayCorrect: false }]));
  return buildComparisonMap(predicted, actual);
}
