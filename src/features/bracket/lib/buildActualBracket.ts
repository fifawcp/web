import { PICKABLE_MATCH_IDS } from "@/features/pickems/lib/bracketStructure";
import type { BracketMatchSlot, BracketStageCode } from "@/features/pickems/types/pickems.types";
import type { Match } from "@/features/schedule/types/schedule.types";

// The 32 knockout match ids (R32 → Final, incl. third place). A match's id is
// its bracket "code" — e.g. the Final is M104 — so this is the only mapping
// needed to slot a `/matches` row into the bracket.
const KNOCKOUT_MATCH_IDS = new Set<number>(PICKABLE_MATCH_IDS);

/**
 * Project the *actual* tournament bracket from `/matches`.
 *
 * Each knockout match carries its real `teams` (home/away resolve as earlier
 * rounds finish) and, once played, a `result.winner_team_fifa_code`. We map each
 * to a `BracketMatchSlot` so the same pickems bracket components can render the
 * live tree, with `picked_team` = the actual winner.
 *
 * Group-stage matches are ignored — only the 32 knockout ids feed the bracket.
 */
export function buildActualBracket(matches: Match[]): BracketMatchSlot[] {
  const slots: BracketMatchSlot[] = [];
  for (const match of matches) {
    if (!KNOCKOUT_MATCH_IDS.has(match.id)) continue;

    const home = match.teams.home;
    const away = match.teams.away;
    const winnerCode = match.result?.winner_team_fifa_code ?? null;
    const winner = winnerCode ? (home?.fifa_code === winnerCode ? home : away?.fifa_code === winnerCode ? away : null) : null;

    slots.push({
      // Filtered to knockout ids above, so the stage is never `group_stage`.
      match_id: match.id,
      stage_code: match.stage_code as BracketStageCode,
      home_team: home,
      away_team: away,
      picked_team: winner,
    });
  }
  return slots;
}
