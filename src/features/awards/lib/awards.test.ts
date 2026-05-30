import { describe, expect, it } from "vitest";

import type { AwardType, FilledAwardPick, Player, ResolvedAwardPick } from "../types/awards.types";

import { AWARD_TYPES, findPick, playerSearchDebounceMs, removePick, toPickInputs, upsertPick } from "./awards";

function makePlayer(id: number): Player {
  return {
    id,
    name: `Player ${id}`,
    first_name: "Player",
    last_name: String(id),
    age: 25,
    nationality: "ESP",
    photo_url: "",
    position: "attacker",
    team: { fifa_code: "ESP", name: { en: "Spain" }, flag_url: "", group_code: null },
    club: { name: "FC", logo_url: "" },
  };
}

function pick(award: AwardType, id: number): FilledAwardPick {
  return { award_type: award, player: makePlayer(id) };
}

describe("upsertPick", () => {
  it("adds a new slot, keeping canonical order", () => {
    const result = upsertPick([pick("golden_glove", 1)], pick("golden_boot", 2));
    expect(result.map((p) => p.award_type)).toEqual(["golden_boot", "golden_glove"]);
  });

  it("replaces the player for an existing slot without duplicating it", () => {
    const result = upsertPick([pick("golden_boot", 1)], pick("golden_boot", 99));
    expect(result).toHaveLength(1);
    expect(result[0].player.id).toBe(99);
  });

  it("orders all four awards canonically regardless of insertion order", () => {
    let picks: FilledAwardPick[] = [];
    for (const type of ["young_player", "golden_glove", "golden_ball", "golden_boot"] as AwardType[]) {
      picks = upsertPick(picks, pick(type, 1));
    }
    expect(picks.map((p) => p.award_type)).toEqual([...AWARD_TYPES]);
  });
});

describe("removePick", () => {
  it("drops only the targeted slot", () => {
    const result = removePick([pick("golden_boot", 1), pick("golden_ball", 2)], "golden_boot");
    expect(result.map((p) => p.award_type)).toEqual(["golden_ball"]);
  });
});

describe("findPick", () => {
  it("returns the matching slot or undefined", () => {
    const picks = [pick("golden_glove", 7)];
    expect(findPick(picks, "golden_glove")?.player?.id).toBe(7);
    expect(findPick(picks, "golden_boot")).toBeUndefined();
  });
});

describe("toPickInputs", () => {
  it("maps resolved picks to the PUT body shape", () => {
    expect(toPickInputs([pick("golden_boot", 3)])).toEqual([{ award_type: "golden_boot", player_id: 3 }]);
  });

  it("skips null-player slots (canonical 4-slot response is safe to pass through)", () => {
    // Mirrors GET /awards: one slot per award type, player null when unpicked.
    const canonical: ResolvedAwardPick[] = [
      { award_type: "golden_boot", player: makePlayer(7) },
      { award_type: "golden_ball", player: null },
      { award_type: "golden_glove", player: null },
      { award_type: "young_player", player: null },
    ];
    expect(toPickInputs(canonical)).toEqual([{ award_type: "golden_boot", player_id: 7 }]);
  });
});

describe("playerSearchDebounceMs", () => {
  it("waits longer for short/broad queries and shortens as the query grows", () => {
    expect(playerSearchDebounceMs("me")).toBe(120);
    expect(playerSearchDebounceMs("mess")).toBe(60);
    expect(playerSearchDebounceMs("messi")).toBe(30);
  });

  it("ignores surrounding whitespace when sizing the delay", () => {
    expect(playerSearchDebounceMs("  ab  ")).toBe(120);
  });
});
