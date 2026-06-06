import { AWARD_TYPES } from "@/features/awards/lib/awards";
import type { AwardType } from "@/features/awards/types/awards.types";
import { isPickemComplete } from "@/features/pickems/lib/isPickemComplete";
import type { PickemProgress } from "@/features/pickems/types/pickems.types";
import { computeMatchUiState } from "@/features/schedule/lib/computeMatchUiState";
import type { Match } from "@/features/schedule/types/schedule.types";

import type { Competition } from "../types/competitions.types";

import { resolveScope } from "./formatScope";
import { resolvePickMatch } from "./resolvePickMatch";

// Derived state of the viewer's picks for one competition, computed from already-fetched data — no
// extra API calls. `none` is defensive: no in-scope matches resolved (e.g. a pick match not loaded).
export type CompetitionPickState = { kind: "needs-pick"; countdownTarget?: string; matchId?: number } | { kind: "picks-done" } | { kind: "closed" } | { kind: "none" };

export const competitionNeedsPick = (state: CompetitionPickState): boolean => state.kind === "needs-pick";

type AwardsContext = { pickedTypes: AwardType[]; isLocked: boolean };

function fromMatches(matches: Match[], now: Date): CompetitionPickState {
  if (matches.length === 0) return { kind: "none" };

  let earliest: Match | null = null;
  let anyOpen = false;
  for (const match of matches) {
    const { isLocked, hasPick } = computeMatchUiState(match, now);
    if (isLocked) continue;
    anyOpen = true;
    const isPickable = match.teams.home != null && match.teams.away != null;
    if (isPickable && !hasPick && (!earliest || new Date(match.kickoff_at) < new Date(earliest.kickoff_at))) {
      earliest = match;
    }
  }

  if (earliest) return { kind: "needs-pick", countdownTarget: earliest.kickoff_at, matchId: earliest.id };
  if (anyOpen) return { kind: "picks-done" };
  return { kind: "closed" };
}

// A match-type ("custom") competition: every match whose stage is in scope and (all teams, or one
// side is in the team set). Mirrors the server's scoring scope so the badge can't lie.
function getMatchCompetitionPickState(competition: Competition, matches: Match[], now: Date): CompetitionPickState {
  const scope = resolveScope(competition);
  const stages = new Set(scope.stages);
  const teams = new Set(scope.teamCodes);
  const inScope = matches.filter((match) => {
    if (!stages.has(match.stage_code)) return false;
    if (scope.isAllTeams) return true;
    return [match.teams.home?.fifa_code, match.teams.away?.fifa_code].some((code) => code != null && teams.has(code));
  });
  return fromMatches(inScope, now);
}

// A pick competition covers exactly one match.
function getPickCompetitionPickState(competition: Competition, matches: Match[], now: Date): CompetitionPickState {
  const match = resolvePickMatch(competition, matches);
  return fromMatches(match ? [match] : [], now);
}

// A pick'em competition tracks the tournament-wide bracket. Completion comes from the pick'em
// progress; the earliest still-upcoming match seeds the card countdown when still open.
function getPickemPickState(progress: PickemProgress | null, isLocked: boolean, matches: Match[], now: Date): CompetitionPickState {
  if (progress && isPickemComplete(progress)) return { kind: "picks-done" };
  if (isLocked) return { kind: "closed" };
  return { kind: "needs-pick", countdownTarget: nextKickoffAfter(matches, now) };
}

// Awards complete once all four honors are picked; the countdown mirrors pick'em (lock at kickoff).
function getAwardsPickState(awards: AwardsContext, matches: Match[], now: Date): CompetitionPickState {
  if (awards.pickedTypes.length >= AWARD_TYPES.length) return { kind: "picks-done" };
  if (awards.isLocked) return { kind: "closed" };
  return { kind: "needs-pick", countdownTarget: nextKickoffAfter(matches, now) };
}

function nextKickoffAfter(matches: Match[], now: Date): string | undefined {
  const nowMs = now.getTime();
  return matches
    .map((m) => m.kickoff_at)
    .filter((k) => new Date(k).getTime() > nowMs)
    .sort()[0];
}

// Top-level dispatcher used by the card.
export function getCompetitionPickState(
  competition: Competition,
  matches: Match[],
  now: Date,
  pickem?: { progress: PickemProgress | null; isLocked: boolean },
  awards?: AwardsContext
): CompetitionPickState {
  switch (competition.type) {
    case "pick":
      return getPickCompetitionPickState(competition, matches, now);
    case "pickem":
      return getPickemPickState(pickem?.progress ?? null, pickem?.isLocked ?? false, matches, now);
    case "awards":
      return awards ? getAwardsPickState(awards, matches, now) : { kind: "none" };
    default:
      return getMatchCompetitionPickState(competition, matches, now);
  }
}
