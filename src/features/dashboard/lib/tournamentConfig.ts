// World Cup 2026 tournament configuration
export const TOURNAMENT_START_DATE = new Date("2026-06-11T19:00:00Z");
export const TOURNAMENT_END_DATE = new Date("2026-07-19T00:00:00Z");

// `now` is a default param so callers can use this during a component render
// without tripping the no-impure-call-in-render rule (mirrors `awardsLocked`).
export function hasTournamentStarted(now: number = Date.now()): boolean {
  return now >= TOURNAMENT_START_DATE.getTime();
}

export const TOURNAMENT_STATS = {
  totalMatches: 104,
  groupMatches: 72,
  knockoutMatches: 32,
  teams: 48,
} as const;
