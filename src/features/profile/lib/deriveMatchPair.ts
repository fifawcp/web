import type { Match } from "@/features/schedule/types/schedule.types";

export type MatchPair = {
  /** The most recently finished match — null before kickoff. */
  lastPlayed: Match | null;
  /** The next upcoming match the user can still pick — null once every match has played. */
  nextUpcoming: Match | null;
  /** True once *any* match has kicked off (or has a recorded result). Drives the pickem-locked view. */
  isTournamentStarted: boolean;
};

/**
 * Walk the full match list once and derive the three pieces of state the
 * profile page needs:
 *   1. The most recently finished match (for the "Last played" peek row)
 *   2. The next upcoming match (for the "Next up" peek row)
 *   3. Whether the tournament has started (drives PickemPeek's locked
 *      variant — once the first whistle blows, predictions freeze)
 *
 * Single pass + a couple of comparisons; the schedule page already pays
 * for the fetch, so this is essentially free.
 */
export function deriveMatchPair(matches: Match[] | null | undefined, now: Date = new Date()): MatchPair {
  if (!matches || matches.length === 0) {
    return { lastPlayed: null, nextUpcoming: null, isTournamentStarted: false };
  }

  const nowMs = now.getTime();
  let lastPlayed: Match | null = null;
  let nextUpcoming: Match | null = null;
  let isTournamentStarted = false;

  for (const m of matches) {
    const kickoffMs = new Date(m.kickoff_at).getTime();
    if (Number.isNaN(kickoffMs)) continue;

    const hasKickedOff = kickoffMs <= nowMs;
    if (hasKickedOff) isTournamentStarted = true;

    if (hasKickedOff) {
      // "Last played" = most recent match whose kickoff has passed, even
      // if it isn't formally marked finished yet (test data lag, live
      // games). The render layer handles "result vs no result" framing.
      if (!lastPlayed || kickoffMs > new Date(lastPlayed.kickoff_at).getTime()) {
        lastPlayed = m;
      }
    } else {
      // Earliest upcoming kickoff strictly in the future.
      if (!nextUpcoming || kickoffMs < new Date(nextUpcoming.kickoff_at).getTime()) {
        nextUpcoming = m;
      }
    }
  }

  return { lastPlayed, nextUpcoming, isTournamentStarted };
}
