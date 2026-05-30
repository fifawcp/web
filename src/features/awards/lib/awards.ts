import { Footprints, Hand, Star, Trophy, type LucideIcon } from "lucide-react";

import { getTeamName } from "@/shared/lib/getTeamName";

import type { AwardPickInput, AwardType, FilledAwardPick, Player, PlayerPosition, ResolvedAwardPick } from "../types/awards.types";

/** Per-award reward, in points (kept here so UI + rules stay in sync). */
export const AWARD_POINTS = 20;

/** Canonical order the backend resolves slots in — drives the card grid order. */
export const AWARD_TYPES: readonly AwardType[] = ["golden_boot", "golden_ball", "golden_glove", "young_player"] as const;

export const AWARDS_TOTAL = AWARD_TYPES.length;

type AwardConfig = {
  icon: LucideIcon;
  /**
   * Position the player picker pre-applies (and locks) for this award.
   * Only the Golden Glove is position-bound (goalkeepers).
   */
  lockedPosition?: PlayerPosition;
  /**
   * Maximum eligible age. The Young Player award is U21 — the backend rejects
   * older players, and there's no age query param, so the picker filters the
   * results client-side to keep the user from picking an ineligible player.
   */
  maxAge?: number;
};

export const AWARD_CONFIG: Record<AwardType, AwardConfig> = {
  golden_boot: { icon: Footprints },
  golden_ball: { icon: Trophy },
  golden_glove: { icon: Hand, lockedPosition: "goalkeeper" },
  young_player: { icon: Star, maxAge: 21 },
};

export const PLAYER_POSITIONS: readonly PlayerPosition[] = ["goalkeeper", "defender", "midfielder", "attacker"] as const;

/** The resolved pick for one award slot, or `undefined` when empty. */
export function findPick(picks: ResolvedAwardPick[], type: AwardType): ResolvedAwardPick | undefined {
  return picks.find((p) => p.award_type === type);
}

/**
 * Localized country label for a player. Falls back to the raw `nationality`
 * string when the upstream catalog omits the `team` object — guards against
 * the null-team crash the flag avatar also defends against.
 */
export function playerCountry(player: Player, locale: string): string {
  return player.team ? getTeamName(player.team, locale) : (player.nationality ?? "");
}

/**
 * The filled slots only (player resolved), narrowed to `FilledAwardPick`.
 * GET /awards returns one slot per award type with `player: null` for the
 * unpicked ones — everything downstream (PUT body, progress, drafts) works
 * off the filled subset.
 */
export function filledPicks(picks: ResolvedAwardPick[]): FilledAwardPick[] {
  return picks.filter((p): p is FilledAwardPick => p.player != null);
}

/**
 * Map picks to the PUT body shape. Defensively skips null-player slots so a
 * canonical 4-slot response can be passed straight through without crashing.
 */
export function toPickInputs(picks: ResolvedAwardPick[]): AwardPickInput[] {
  return filledPicks(picks).map((p) => ({ award_type: p.award_type, player_id: p.player.id }));
}

/**
 * Return a new filled-picks array with `type` set to `player` — replacing any
 * existing pick for that slot, in canonical award order. Pure.
 */
export function upsertPick(picks: FilledAwardPick[], next: FilledAwardPick): FilledAwardPick[] {
  const without = picks.filter((p) => p.award_type !== next.award_type);
  const merged = [...without, next];
  return AWARD_TYPES.filter((t) => merged.some((p) => p.award_type === t)).map((t) => merged.find((p) => p.award_type === t)!);
}

/** Return a new filled-picks array with the slot for `type` removed. */
export function removePick(picks: FilledAwardPick[], type: AwardType): FilledAwardPick[] {
  return picks.filter((p) => p.award_type !== type);
}

/**
 * Canonical 4-slot array (one per award type, in order) with `type`'s player
 * set to `player` (or null to clear it). Used for the local-first cache writes
 * so the cache always holds the same one-slot-per-type shape the server
 * returns. Pure.
 */
export function setSlot(picks: ResolvedAwardPick[], type: AwardType, player: Player | null): ResolvedAwardPick[] {
  return AWARD_TYPES.map((t) => {
    if (t === type) return { award_type: t, player };
    return { award_type: t, player: picks.find((p) => p.award_type === t)?.player ?? null };
  });
}

/** Build the canonical 4-slot array from a filled-picks list (draft → cache). */
export function canonicalSlots(filled: FilledAwardPick[]): ResolvedAwardPick[] {
  return AWARD_TYPES.map((t) => ({ award_type: t, player: filled.find((p) => p.award_type === t)?.player ?? null }));
}

/**
 * Tiered debounce for the player search input. Short/broad queries wait a
 * little longer (the user is likely still typing and a 1–2 char query matches
 * thousands of rows); longer, more specific queries fire almost immediately so
 * results feel instant. Keeps requests cheap without a sluggish feel.
 */
export function playerSearchDebounceMs(query: string): number {
  const len = query.trim().length;
  if (len <= 2) return 120;
  if (len <= 4) return 60;
  return 30;
}
