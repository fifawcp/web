import type { Match } from "../types/schedule.types";

import { isCorrectOutcome, isCorrectScore } from "./scoring";

export type PickStats = {
  total: number;
  picked: number;
  missed: number;
  pendingToday: number;
  pendingAll: number;
  correctScores: number;
  correctOutcomes: number;
};

export function computePickStats(matches: Match[], now: Date = new Date()): PickStats {
  const nowMs = now.getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;

  let picked = 0;
  let missed = 0;
  let pendingAll = 0;
  let pendingToday = 0;
  let correctScores = 0;
  let correctOutcomes = 0;

  for (const match of matches) {
    const isPicked = match.user_score_pick != null;

    if (isPicked) {
      picked++;
      if (match.status === "finished" && match.result) {
        if (isCorrectScore(match.user_score_pick!, match.result)) correctScores++;
        if (isCorrectOutcome(match.user_score_pick!, match.result)) correctOutcomes++;
      }
      continue;
    }

    const hasTeams = match.teams.home != null && match.teams.away != null;
    const kickoffMs = new Date(match.kickoff_at).getTime();
    const kickoffPassed = kickoffMs <= nowMs;

    if (kickoffPassed && hasTeams) {
      missed++;
      continue;
    }

    if (!kickoffPassed && hasTeams) {
      pendingAll++;
      if (kickoffMs >= todayStart && kickoffMs < tomorrowStart) pendingToday++;
    }
  }

  return { total: matches.length, picked, missed, pendingToday, pendingAll, correctScores, correctOutcomes };
}
