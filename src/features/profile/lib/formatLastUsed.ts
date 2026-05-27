/**
 * Coarse relative-time formatter for session "last used" timestamps. We use
 * Intl.RelativeTimeFormat so the strings localise correctly without us
 * shipping our own dictionary. Returns "just now" within the first minute.
 */
export function formatLastUsed(iso: string, locale: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absSec < 60) return rtf.format(0, "minute"); // "now" / "ahora"
  if (absSec < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (absSec < 86_400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (absSec < 2_592_000) return rtf.format(Math.round(diffSec / 86_400), "day");
  if (absSec < 31_536_000) return rtf.format(Math.round(diffSec / 2_592_000), "month");
  return rtf.format(Math.round(diffSec / 31_536_000), "year");
}
