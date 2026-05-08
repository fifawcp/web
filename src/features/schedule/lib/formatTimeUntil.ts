// Coarse "time remaining" formatter for the kickoff countdown badge
// Returns null when the target is already in the past
//   > 24h  → "2d 3h"
//   1-24h  → "1h 24m"
//   < 1h   → "23m"
//   < 1m   → "<1m"
export function formatTimeUntil(now: Date, target: Date): string | null {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return null;

  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 1) return "<1m";

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 1) return `${totalMinutes}m`;

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days >= 1) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
