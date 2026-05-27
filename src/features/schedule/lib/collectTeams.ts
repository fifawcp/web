import type { Match, Team } from "../types/schedule.types";

// Collects every unique team appearing in the match list, sorted by FIFA code
// Used to populate the team filter dropdown
export function collectTeams(matches: Match[]): Team[] {
  const seen = new Map<string, Team>();

  for (const match of matches) {
    const { home, away } = match.teams;

    if (home && !seen.has(home.fifa_code)) {
      seen.set(home.fifa_code, home);
    }

    if (away && !seen.has(away.fifa_code)) {
      seen.set(away.fifa_code, away);
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.fifa_code.localeCompare(b.fifa_code));
}
