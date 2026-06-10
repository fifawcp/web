import type { Match } from "@/features/schedule/types/schedule.types";
import { getTeamName } from "@/shared/lib/getTeamName";

export function buildScheduleJsonLd(matches: Match[], locale: string): { "@context": string; "@graph": unknown[] } {
  const graph: unknown[] = matches
    .filter((m) => m.teams.home !== null && m.teams.away !== null)
    .map((m) => {
      const home = getTeamName(m.teams.home!, locale);
      const away = getTeamName(m.teams.away!, locale);
      return {
        "@type": "SportsEvent",
        name: `${home} vs ${away}`,
        startDate: m.kickoff_at,
        location: {
          "@type": "Place",
          name: m.venue.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: m.venue.city,
          },
        },
        competitor: [
          { "@type": "SportsTeam", name: home },
          { "@type": "SportsTeam", name: away },
        ],
      };
    });

  return { "@context": "https://schema.org", "@graph": graph };
}
