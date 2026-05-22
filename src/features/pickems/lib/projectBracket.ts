import type { Team } from "@/shared/types/wcp.types";

import type { BracketDraft, BracketMatchSlot } from "../types/pickems.types";

import { BRACKET_FEEDERS, BRACKET_LOSER_FEEDERS } from "./bracketStructure";

/**
 * Returns the bracket projected against the user's *local* picks (zustand draft).
 *
 * R32 home/away come from the server (already resolved against groups + best-thirds).
 * R16+ home/away are derived recursively from the local pick at each feeder match.
 * The third-place match (103) is special — its home/away are the *losers* of the
 * two SF matches.
 *
 * `picked_team` for each slot resolves against the *just-computed* home/away,
 * not the original server slot — without this, R16+ picks never reactively
 * resolve, because the server's bracket entries for those rounds arrive with
 * `home_team`/`away_team` set to null until a save round-trips.
 */
export function projectBracket(serverBracket: BracketMatchSlot[], draft: BracketDraft): BracketMatchSlot[] {
  const bySlotId = new Map<number, BracketMatchSlot>();
  for (const slot of serverBracket) bySlotId.set(slot.match_id, slot);

  /** Look up the team the user picked to win a feeder match. */
  const winnerOf = (feederMatchId: number): Team | null => {
    const slot = bySlotId.get(feederMatchId);
    if (!slot) return null;
    const code = draft[feederMatchId];
    if (code) {
      if (slot.home_team?.fifa_code === code) return slot.home_team;
      if (slot.away_team?.fifa_code === code) return slot.away_team;
    }
    return slot.picked_team ?? null;
  };

  /** The losing side of a feeder match — needed for the third-place playoff. */
  const loserOf = (feederMatchId: number): Team | null => {
    const slot = bySlotId.get(feederMatchId);
    if (!slot || !slot.home_team || !slot.away_team) return null;
    const winner = winnerOf(feederMatchId);
    if (!winner) return null;
    return winner.fifa_code === slot.home_team.fifa_code ? slot.away_team : slot.home_team;
  };

  const projected: BracketMatchSlot[] = serverBracket.map((slot) => {
    const winnerFeeders = BRACKET_FEEDERS[slot.match_id];
    const loserFeeders = BRACKET_LOSER_FEEDERS[slot.match_id];

    let home: Team | null;
    let away: Team | null;
    if (winnerFeeders) {
      home = winnerOf(winnerFeeders.home);
      away = winnerOf(winnerFeeders.away);
    } else if (loserFeeders) {
      home = loserOf(loserFeeders.home);
      away = loserOf(loserFeeders.away);
    } else {
      home = slot.home_team;
      away = slot.away_team;
    }

    // Resolve `picked` against the local home/away we just computed.
    const draftCode = draft[slot.match_id];
    let picked: Team | null = null;
    if (draftCode) {
      if (home?.fifa_code === draftCode) picked = home;
      else if (away?.fifa_code === draftCode) picked = away;
    } else if (slot.picked_team) {
      picked = slot.picked_team;
    }

    const next: BracketMatchSlot = { ...slot, home_team: home, away_team: away, picked_team: picked };
    bySlotId.set(slot.match_id, next);
    return next;
  });

  return projected;
}

export function findChampion(bracket: BracketMatchSlot[]): Team | null {
  return bracket.find((slot) => slot.stage_code === "final")?.picked_team ?? null;
}

/**
 * Walks the projected bracket and drops any draft picks that no longer
 * resolve — i.e. the picked team is no longer in the slot's home/away after
 * projecting against the current server bracket. This happens when group order
 * or best-thirds were changed on another device, causing the server to
 * recompute R32 home/away while this device's localStorage still holds the
 * old picks. Returns the cleaned draft and how many entries were dropped, so
 * callers can surface a toast.
 */
export function pruneBracketDraft(serverBracket: BracketMatchSlot[], draft: BracketDraft): { pruned: BracketDraft; removedCount: number } {
  const projected = projectBracket(serverBracket, draft);
  const pruned: BracketDraft = {};
  let removedCount = 0;
  for (const slot of projected) {
    const draftCode = draft[slot.match_id];
    if (draftCode === undefined) continue;
    if (slot.picked_team?.fifa_code === draftCode) {
      pruned[slot.match_id] = draftCode;
    } else {
      removedCount++;
    }
  }
  return { pruned, removedCount };
}
