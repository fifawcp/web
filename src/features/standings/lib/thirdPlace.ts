import type { GroupStandings, TeamStandingRow, ThirdPlaceRow, ThirdPlaceStandings } from "../types/standings.types";

import { compareStanding } from "./groupStandings";

/** Third-placed teams that advance to the Round of 32 in the 48-team format. */
const QUALIFYING_SLOTS = 8;

/**
 * Collapse the 12 group tables into a single cross-group ranking of every
 * third-placed team. They are ranked with the same comparator as a group
 * table (points, goal difference, goals scored, fair play, FIFA code), and the
 * top `QUALIFYING_SLOTS` advance to the Round of 32.
 */
export function buildThirdPlaceStandings(groups: GroupStandings[]): ThirdPlaceStandings {
  const thirds = groups.map((group) => group.rows.find((row) => row.position === 3)).filter((row): row is TeamStandingRow => row !== undefined);

  thirds.sort(compareStanding);

  const rows: ThirdPlaceRow[] = thirds.map((row, index) => ({
    ...row,
    third_place_rank: index + 1,
    advances: index < QUALIFYING_SLOTS,
  }));

  return { rows, qualifying_slots: QUALIFYING_SLOTS };
}
