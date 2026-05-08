import type { Match } from "../types/schedule.types";

export type MatchDateGroup = {
  // YYYY-MM-DD in the user's local timezone — stable key for React
  key: string;
  // Date object pinned to the local-day midnight; format with Intl on render
  date: Date;
  matches: Match[];
};

// Buckets matches by the user's local date
export function groupMatchesByLocalDate(matches: Match[]): MatchDateGroup[] {
  const groups = new Map<string, MatchDateGroup>();

  for (const match of matches) {
    const kickoff = new Date(match.kickoff_at);
    const key = localDateKey(kickoff);

    let group = groups.get(key);
    if (!group) {
      group = { key, date: localStartOfDay(kickoff), matches: [] };
      groups.set(key, group);
    }
    group.matches.push(match);
  }

  return Array.from(groups.values());
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localStartOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
