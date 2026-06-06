import type { Match } from "@/features/schedule/types/schedule.types";

import type { Competition } from "../types/competitions.types";

// The single match a `pool` competition covers, or null (non-pool, or the match isn't loaded).
export function resolvePoolMatch(competition: Competition, matches: Match[]): Match | null {
  if (competition.pool_match_id == null) return null;
  return matches.find((m) => m.id === competition.pool_match_id) ?? null;
}
