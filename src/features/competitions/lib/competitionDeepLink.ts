import type { Competition } from "../types/competitions.types";

import type { CompetitionPickState } from "./competitionPickStatus";

// Where the "make/edit picks" CTA sends the user. The `?match=<id>` param is a scroll hint the
// schedule page reads (see ScheduleView).
export function competitionDeepLink(competition: Competition, pickState: CompetitionPickState): string {
  switch (competition.type) {
    case "pickem":
      return "/pickems";
    case "pool":
      return competition.pool_match_id != null ? `/schedule?match=${competition.pool_match_id}` : "/schedule";
    default: {
      const matchId = pickState.kind === "needs-pick" ? pickState.matchId : undefined;
      return matchId != null ? `/schedule?match=${matchId}` : "/schedule";
    }
  }
}
