import type { Match } from "../types/dashboard.types";

type NextMatchSource = {
  // Primary field: the array of simultaneous upcoming matches.
  next_matches?: Match[] | null;
  // Fallback (older API / safety net): a single upcoming match.
  next_match?: Match | null;
};

// Resolve the dashboard's upcoming matches to a Match[]. The `next_matches` array is
// authoritative when present (even if empty); `next_match` is only used as a fallback
// when the array is absent.
export function resolveNextMatches(source: NextMatchSource): Match[] {
  if (Array.isArray(source.next_matches)) return source.next_matches;
  return source.next_match ? [source.next_match] : [];
}
