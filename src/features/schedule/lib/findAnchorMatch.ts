import type { Match } from "../types/schedule.types";

// Returns the id of the match the user should land on when the page opens
export function findAnchorMatchId(matches: Match[], now: Date = new Date()): number | null {
  if (matches.length === 0) return null;

  // Anchor on today's first match (kickoff on or after today's midnight) so the
  // user lands on today's group even if its matches have already kicked off.
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const upcoming = matches.find((match) => new Date(match.kickoff_at).getTime() >= todayStart);

  if (upcoming) return upcoming.id;

  // No matches today or later — fall back to the most recent one
  return matches[matches.length - 1].id;
}
