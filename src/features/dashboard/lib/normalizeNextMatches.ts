import type { Match, NextMatchPayload } from "../types/dashboard.types";

// The dashboard API may send the upcoming match as a single object (the original
// shape) or an array of simultaneous matches (after the API change). Normalize
// either shape — plus null/undefined — to a Match[] so the rest of the dashboard
// never has to care which one arrived.
export function normalizeNextMatches(raw: NextMatchPayload | undefined): Match[] {
  if (Array.isArray(raw)) return raw;
  return raw ? [raw] : [];
}
