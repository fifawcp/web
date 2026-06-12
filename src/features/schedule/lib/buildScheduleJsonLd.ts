import type { Match } from "@/features/schedule/types/schedule.types";
import { SITE_URL } from "@/lib/site";
import { getTeamName } from "@/shared/lib/getTeamName";

// A match runs ~2h (90' + halftime + stoppage); used to estimate endDate.
const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

const ORGANIZER = { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" } as const;

const EVENT_IMAGE = `${SITE_URL}/og-cover.webp`;

const describe: Record<string, (home: string, away: string, venue: string, city: string) => string> = {
  en: (home, away, venue, city) => `${home} vs ${away} — FIFA World Cup 2026 match at ${venue}, ${city}.`,
  es: (home, away, venue, city) => `${home} vs ${away} — Partido de la Copa Mundial 2026 en ${venue}, ${city}.`,
};

export function buildScheduleJsonLd(matches: Match[], locale: string): { "@context": string; "@graph": unknown[] } {
  const description = describe[locale] ?? describe.en;

  const graph: unknown[] = matches
    .filter((m) => m.teams.home !== null && m.teams.away !== null)
    .map((m) => {
      const home = getTeamName(m.teams.home!, locale);
      const away = getTeamName(m.teams.away!, locale);
      const teams = [
        { "@type": "SportsTeam", name: home },
        { "@type": "SportsTeam", name: away },
      ];
      return {
        "@type": "SportsEvent",
        name: `${home} vs ${away}`,
        description: description(home, away, m.venue.name, m.venue.city),
        startDate: m.kickoff_at,
        endDate: new Date(new Date(m.kickoff_at).getTime() + MATCH_DURATION_MS).toISOString(),
        eventStatus: "https://schema.org/EventScheduled",
        image: [EVENT_IMAGE],
        location: {
          "@type": "Place",
          name: m.venue.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: m.venue.city,
          },
        },
        organizer: ORGANIZER,
        competitor: teams,
        performer: teams,
      };
    });

  return { "@context": "https://schema.org", "@graph": graph };
}
