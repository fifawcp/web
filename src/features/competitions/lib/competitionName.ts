// Seeded "default" competitions arrive from the API with a fixed English name (e.g. "All Matches").
// Map those known names to i18n keys so they localize like any other UI string. User-created
// competition names have no entry here and pass through untouched. Keys are lowercase — lookups
// normalize casing so "All Matches"/"All matches"/"all matches" all resolve.
const DEFAULT_NAME_KEYS: Record<string, string> = {
  "all matches": "fullTournament",
};

export function resolveCompetitionNameKey(name: string): string | null {
  return DEFAULT_NAME_KEYS[name.trim().toLowerCase()] ?? null;
}
