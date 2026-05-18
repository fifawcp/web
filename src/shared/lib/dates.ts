/**
 * Coarse "time remaining" string. Returns null when target is in the past.
 * @example formatTimeUntil(new Date(), new Date(Date.now() + 5_400_000)) // "1h 30m"
 */
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

/**
 * 12-hour AM/PM time string from a Date.
 * @example formatKickoffTime(new Date('2026-06-14T18:00:00')) // "6:00 PM"
 */
export function formatKickoffTime(date: Date): string {
  const h = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${period}`;
}

/**
 * Locale-aware "Weekday, Month Day" header string.
 * @example formatDateHeader(new Date('2026-06-14'), 'en') // "Sunday, June 14"
 */
export function formatDateHeader(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Formats a date to a month day format
 * @example formatShortDate(new Date('2026-06-14'), 'en') // "Jun 14"
 */
export function formatShortDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
  }).format(date);
}
