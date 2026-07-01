import { describe, expect, it } from "vitest";

import type { Match } from "@/features/schedule/types/schedule.types";
import type { Team } from "@/shared/types/wcp.types";

import { buildSimulatorBracket, countSimulatorEdits } from "./simulatorBracket";

const team = (code: string): Team => ({
  fifa_code: code,
  name: { en: code, es: code },
  flag_url: `https://flags.test/${code}.svg`,
  group_code: null,
});

// R32 matches 74 & 77 feed R16 match 89 (home = winner of 74, away = winner of 77).
const r32 = (id: number, home: Team, away: Team, winner: Team): Match => ({
  id,
  stage_code: "round_of_32",
  group_code: null,
  teams: { home, away },
  venue: { name: "", city: "" },
  kickoff_at: "2026-07-01T00:00:00Z",
  status: "finished",
  result: { home_score: 1, away_score: 0, penalties: null, winner_team_fifa_code: winner.fifa_code },
  user_score_pick: null,
});

const ARG = team("ARG");
const BRA = team("BRA");
const FRA = team("FRA");
const GER = team("GER");

// R16 slot resolves its participants from the feeders, so it starts team-less.
const r16Empty: Match = {
  id: 89,
  stage_code: "round_of_16",
  group_code: null,
  teams: { home: null, away: null },
  venue: { name: "", city: "" },
  kickoff_at: "2026-07-05T00:00:00Z",
  status: "scheduled",
  result: null,
  user_score_pick: null,
};

const matches: Match[] = [r32(74, ARG, BRA, ARG), r32(77, FRA, GER, FRA), r16Empty];

describe("buildSimulatorBracket", () => {
  it("seeds the R16 matchup from the real R32 winners with an empty draft", () => {
    const slots = buildSimulatorBracket(matches, {});
    const r16 = slots.find((s) => s.match_id === 89)!;
    expect(r16.home_team?.fifa_code).toBe("ARG");
    expect(r16.away_team?.fifa_code).toBe("FRA");
  });

  it("recomputes the downstream matchup when an earlier winner is overridden", () => {
    const slots = buildSimulatorBracket(matches, { 74: "BRA" });
    const r16 = slots.find((s) => s.match_id === 89)!;
    // BRA now advances from match 74, so it takes the R16 home slot.
    expect(r16.home_team?.fifa_code).toBe("BRA");
    expect(r16.away_team?.fifa_code).toBe("FRA");
  });
});

describe("countSimulatorEdits", () => {
  it("counts an override that diverges from the real result", () => {
    expect(countSimulatorEdits(matches, { 74: "BRA" })).toBe(1);
  });

  it("ignores an override that merely re-affirms the real winner", () => {
    expect(countSimulatorEdits(matches, { 74: "ARG" })).toBe(0);
  });

  it("is zero for an untouched bracket", () => {
    expect(countSimulatorEdits(matches, {})).toBe(0);
  });
});
