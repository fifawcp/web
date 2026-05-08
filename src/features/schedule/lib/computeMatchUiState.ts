import type { Match } from "../types/schedule.types";

export type MatchUiState = {
  isFinished: boolean;
  isLocked: boolean;
  hasPick: boolean;
};

export function computeMatchUiState(match: Match, now: Date = new Date()): MatchUiState {
  const isFinished = match.status === "finished";
  const kickoffPassed = now.getTime() >= new Date(match.kickoff_at).getTime();
  const isLocked = isFinished || kickoffPassed;
  const hasPick = match.user_score_pick != null;

  return { isFinished, isLocked, hasPick };
}
