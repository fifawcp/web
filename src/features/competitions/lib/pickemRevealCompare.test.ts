import { describe, expect, it } from "vitest";

import { buildComparisonMap, summarizeBracket } from "@/features/bracket/lib/bracketCompare";
import type { BracketMatchSlot, BracketStageCode, RankedTeam, ResolvedGroupPick } from "@/features/pickems/types/pickems.types";
import type { StandingRow } from "@/features/standings/types/standings.types";
import type { GroupCode, Team } from "@/shared/types/wcp.types";

import { buildBracketReveal, buildGroupReveal, buildThirdsReveal } from "./pickemRevealCompare";

// ---------------------------------------------------------------------------
// Fixtures — a tournament at the semifinal stage:
//   • all 12 groups have played their 3 matchdays (final tables),
//   • the R32, R16 and QF are decided, the two semifinals are in progress.
// ---------------------------------------------------------------------------

const GROUP_CODES: GroupCode[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function team(code: string, group: GroupCode | null = null): Team {
  return { fifa_code: code, name: { en: code }, flag_url: "", group_code: group };
}

function standing(t: Team, position: number, points: number): StandingRow {
  return { team: t, position, matches_played: 3, wins: 0, draws: 0, losses: 0, goals_for: points, goals_against: 0, goal_difference: points, points };
}

function ranked(code: string, group: GroupCode, position: number): RankedTeam {
  return { fifa_code: code, name: { en: code }, flag_url: "", group_code: group, position };
}

// Final group tables. Third-placed teams get a cross-group points gradient
// (A3 highest … L3 lowest) so the best-thirds ranking is deterministic: A3–H3
// advance, I3–L3 miss the cut.
const standings: StandingRow[] = GROUP_CODES.flatMap((code, g) => [1, 2, 3, 4].map((pos) => standing(team(`${code}${pos}`, code), pos, pos === 3 ? 12 - g : 5 - pos)));

// The member's group order: group A perfect (4 exact = 12 pts), group B with 1st
// and 2nd swapped (two top-2 misses +1 each, two exact +3 = 8 pts), the rest exact.
const groupPicks: ResolvedGroupPick[] = GROUP_CODES.map((code) => {
  const order = code === "B" ? [2, 1, 3, 4] : [1, 2, 3, 4];
  return { group_code: code, locked: true, teams: order.map((pos, idx) => ranked(`${code}${pos}`, code, idx + 1)) };
});

// The member's best-thirds: 7 that advance (A3–G3), plus I3 which misses; they
// leave out H3 (which advances).
const bestThirds: Team[] = ["A3", "B3", "C3", "D3", "E3", "F3", "G3", "I3"].map((c) => team(c, c[0] as GroupCode));

// --- Bracket: one fully-decided arm through the QF, into a live semifinal. ----
function slot(matchId: number, stage: BracketStageCode, home: Team | null, away: Team | null, picked: Team | null): BracketMatchSlot {
  return { match_id: matchId, stage_code: stage, home_team: home, away_team: away, picked_team: picked };
}

const A1 = team("A1");
const B2 = team("B2");
const C1 = team("C1");
const D2 = team("D2");
const E1 = team("E1");
const G1 = team("G1");

// Reality: A1 wins its R32, R16, QF; the SF is not yet played. In a parallel R32,
// C1 beats D2.
const actualBracket: BracketMatchSlot[] = [
  slot(73, "round_of_32", A1, B2, A1),
  slot(74, "round_of_32", C1, D2, C1),
  slot(89, "round_of_16", A1, C1, A1),
  slot(97, "quarterfinals", A1, E1, A1),
  slot(101, "semifinals", A1, G1, null), // in progress
];

// The member: correct on A1's whole run and the R32 matchups, but wrongly picked
// D2 to win match 74.
const memberBracket: BracketMatchSlot[] = [
  slot(73, "round_of_32", A1, B2, A1),
  slot(74, "round_of_32", C1, D2, D2), // right teams reach R32, wrong winner
  slot(89, "round_of_16", A1, C1, A1),
  slot(97, "quarterfinals", A1, E1, A1),
  slot(101, "semifinals", A1, G1, A1),
];

describe("group reveal at the semifinal stage", () => {
  const reveal = buildGroupReveal(groupPicks, standings, true);

  it("grades every group as decided once the group stage is over", () => {
    expect([...reveal.values()].every((g) => g.decided)).toBe(true);
  });

  it("awards a perfect group the full 12 points", () => {
    expect(reveal.get("A")?.summary).toEqual({ correct: 4, total: 4, points: 12, maxPoints: 12 });
  });

  it("scores a 1st/2nd swap as two top-2 hits + two exact = 8 points", () => {
    expect(reveal.get("B")?.summary).toEqual({ correct: 2, total: 4, points: 8, maxPoints: 12 });
  });

  it("orders rows by the actual finishing position", () => {
    expect(reveal.get("A")?.rows.map((r) => r.actualPosition)).toEqual([1, 2, 3, 4]);
  });
});

describe("best-thirds reveal at the semifinal stage", () => {
  const reveal = buildThirdsReveal(bestThirds, standings, true);
  const byCode = new Map(reveal.rows.map((r) => [r.team.fifa_code, r]));

  it("is decided and ranks all twelve thirds, top eight advancing", () => {
    expect(reveal.decided).toBe(true);
    expect(reveal.rows).toHaveLength(12);
    expect(reveal.qualifyingSlots).toBe(8);
  });

  it("marks a picked team that advanced as correct", () => {
    expect(byCode.get("A3")).toMatchObject({ picked: true, advances: true, accuracy: "correct" });
  });

  it("marks a picked team that missed the cut as wrong", () => {
    expect(byCode.get("I3")).toMatchObject({ picked: true, advances: false, accuracy: "wrong" });
  });

  it("leaves an unpicked advancer as not-picked", () => {
    expect(byCode.get("H3")).toMatchObject({ picked: false, advances: true, accuracy: "missed" });
  });
});

describe("bracket reveal at the semifinal stage", () => {
  it("greens every team correctly predicted to REACH a round (incl. the R32 group call)", () => {
    const map = buildBracketReveal(memberBracket, actualBracket, true);
    // Match 74: wrong winner pick, but both teams correctly reached the R32 → both green.
    expect(map.get(74)).toEqual({ homeCorrect: true, awayCorrect: true });
    // A1 correctly placed through every round it reached.
    expect(map.get(89)).toMatchObject({ homeCorrect: true });
    expect(map.get(97)).toMatchObject({ homeCorrect: true });
    expect(map.get(101)).toMatchObject({ homeCorrect: true });
  });

  it("shows nothing for a member who never played", () => {
    const map = buildBracketReveal(memberBracket, actualBracket, false);
    expect([...map.values()].every((c) => !c.homeCorrect && !c.awayCorrect)).toBe(true);
  });

  it("scores points only for advancing — R32+R16+QF = 18, the wrong winner earns 0", () => {
    // Decided: 73 (+4), 74 (+4 wrong → 0), 89 (+6), 97 (+8). SF not played.
    expect(summarizeBracket(actualBracket, memberBracket)).toMatchObject({ earned: 18, possible: 22 });
  });

  it("breaks earned / possible down per round for the legend", () => {
    const { byStage } = summarizeBracket(actualBracket, memberBracket);
    expect(byStage.get("round_of_32")).toEqual({ earned: 4, possible: 8 }); // 73 right, 74 wrong
    expect(byStage.get("round_of_16")).toEqual({ earned: 6, possible: 6 });
    expect(byStage.get("quarterfinals")).toEqual({ earned: 8, possible: 8 });
  });

  it("does not bracket-score reaching the R32 (that is the group stage's job)", () => {
    // Only R32 matches exist, none decided → no points possible yet.
    const onlyR32 = actualBracket.filter((s) => s.stage_code === "round_of_32").map((s) => ({ ...s, picked_team: null }));
    expect(summarizeBracket(onlyR32, memberBracket)).toMatchObject({ earned: 0, possible: 0 });
  });

  it("agrees with /bracket compare on the actual tree (reach-based greens)", () => {
    const map = buildComparisonMap(actualBracket, memberBracket);
    // On the real tree, A1 is greened wherever the member predicted it to reach.
    expect(map.get(73)).toMatchObject({ homeCorrect: true });
    expect(map.get(89)).toMatchObject({ homeCorrect: true });
  });
});
