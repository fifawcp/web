import type { Match } from "@/features/schedule/types/schedule.types";

import type { Competition } from "../types/competitions.types";

// The single match a `pick` competition covers, or null (non-pick, or the match isn't loaded).
export function resolvePickMatch(competition: Competition, matches: Match[]): Match | null {
  if (competition.pick_match_id == null) return null;
  return matches.find((m) => m.id === competition.pick_match_id) ?? null;
}
