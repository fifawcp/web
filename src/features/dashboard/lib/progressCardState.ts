import type { CategoryRecap, DashboardProgress, DashboardRecap } from "../types/dashboard.types";

import { getBracketCompletedStages } from "./pickStatusDerivations";
import { TOURNAMENT_START_DATE } from "./tournamentConfig";

export type ProgressCardStatus = "todo" | "inProgress" | "done" | "locked";

export type ProgressCardState = {
  id: "bracket" | "matchPicks" | "awards";
  status: ProgressCardStatus;
  completed: number;
  total: number;
  percent: number;
  recap: CategoryRecap | null;
  href: string;
};

function deriveStatus(completed: number, total: number, locksAtKickoff: boolean, now: Date): ProgressCardStatus {
  if (locksAtKickoff && now.getTime() >= TOURNAMENT_START_DATE.getTime()) return "locked";
  if (completed <= 0) return "todo";
  if (completed >= total) return "done";
  return "inProgress";
}

function percent(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

const EMPTY_STEP = { completed: 0, total: 0 };
const EMPTY_PICKEM = { groups: EMPTY_STEP, best_thirds: EMPTY_STEP, bracket: EMPTY_STEP };

// Bracket and Awards lock at kickoff and flip to a points recap; Match Picks stays live all tournament.
// Tolerates partial payloads (e.g. the guest dashboard omits some progress blocks).
export function computeProgressCardStates(progress: DashboardProgress, recap: DashboardRecap | null, now: Date = new Date()): ProgressCardState[] {
  const matchPicks = progress.match_picks ?? EMPTY_STEP;
  const awards = progress.awards ?? EMPTY_STEP;
  const bracketCompleted = getBracketCompletedStages(progress.pickem ?? EMPTY_PICKEM);
  const bracketTotal = 3;

  return [
    {
      id: "bracket",
      status: deriveStatus(bracketCompleted, bracketTotal, true, now),
      completed: bracketCompleted,
      total: bracketTotal,
      percent: percent(bracketCompleted, bracketTotal),
      recap: recap?.pickem ?? null,
      href: "/pickems",
    },
    {
      id: "matchPicks",
      status: deriveStatus(matchPicks.completed, matchPicks.total, false, now),
      completed: matchPicks.completed,
      total: matchPicks.total,
      percent: percent(matchPicks.completed, matchPicks.total),
      recap: null,
      href: "/schedule",
    },
    {
      id: "awards",
      status: deriveStatus(awards.completed, awards.total, true, now),
      completed: awards.completed,
      total: awards.total,
      percent: percent(awards.completed, awards.total),
      recap: recap?.awards ?? null,
      href: "/pickems/awards",
    },
  ];
}
