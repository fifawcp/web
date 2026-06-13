import type { Competition } from "../types/competitions.types";

import type { CompetitionPickState } from "./competitionPickStatus";

// Where the "make/edit picks" CTA sends the user. `?match=<id>` is a scroll hint and
// `&edit=1` tells the schedule to open that match's picker when it's still pickable
// (both read by the schedule page → ScheduleView).
export function competitionDeepLink(competition: Competition, pickState: CompetitionPickState): string {
  switch (competition.type) {
    case "pickem":
      return "/pickems";
    case "awards":
      return "/pickems/awards";
    case "pick": {
      if (competition.pick_match_id == null) return "/schedule";
      const editable = pickState.kind !== "closed";
      return `/schedule?match=${competition.pick_match_id}${editable ? "&edit=1" : ""}`;
    }
    default: {
      // The match id is only set when a pick is still needed, so it's always pickable here.
      const matchId = pickState.kind === "needs-pick" ? pickState.matchId : undefined;
      return matchId != null ? `/schedule?match=${matchId}&edit=1` : "/schedule";
    }
  }
}
