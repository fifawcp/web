import type { Match } from "../types/schedule.types";

// Returns the id of the first upcoming unpicked match so the CTA scrolls to
// an actionable section. Falls back progressively so the anchor is always set
export function findAnchorMatchId(matches: Match[], now: Date = new Date()): number | null {
  if (matches.length === 0) return null;

  const nowMs = now.getTime();
  const isUpcoming = (m: Match) => new Date(m.kickoff_at).getTime() > nowMs;
  const hasTeams = (m: Match) => m.teams.home != null && m.teams.away != null;

  // Best: first upcoming match the user can still pick
  const firstUnpicked = matches.find((m) => isUpcoming(m) && hasTeams(m) && m.user_score_pick == null);
  if (firstUnpicked) return firstUnpicked.id;

  // All pickable upcoming matches are done — anchor to the next upcoming match
  const firstUpcoming = matches.find(isUpcoming);
  if (firstUpcoming) return firstUpcoming.id;

  // Tournament is over — fall back to the last match
  return matches[matches.length - 1].id;
}
