import type { Match } from "../types/schedule.types";

import { localDateKey } from "./groupByDate";

// Id of the first match kicking off on the user's local "today", or null when there
// are none. Powers the "go to today" scroll, mirroring findAnchorMatchId but anchored
// to the current day rather than the next unpicked match.
export function findTodayMatchId(matches: Match[], now: Date = new Date()): number | null {
  const todayKey = localDateKey(now);
  const match = matches.find((m) => localDateKey(new Date(m.kickoff_at)) === todayKey);
  return match?.id ?? null;
}
