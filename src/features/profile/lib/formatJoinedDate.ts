/**
 * Locale-aware "long month + day + year" string used in the identity card.
 * @example formatJoinedDate('2026-05-22', 'en') // "May 22, 2026"
 * @example formatJoinedDate('2026-05-22', 'es') // "22 de mayo de 2026"
 */
export function formatJoinedDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
