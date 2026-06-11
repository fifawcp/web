import type { Team } from "@/shared/types/wcp.types";

import type { ResolvedGroupPick, UserPickem } from "../types/pickems.types";

import { bracketSignature } from "./projectBracket";

/** Stable identity of the group picks: per-group ranked order + lock flag. */
export function groupsSignature(groups: ResolvedGroupPick[]): string {
  return [...groups]
    .sort((a, b) => a.group_code.localeCompare(b.group_code))
    .map((group) => `${group.group_code}:${group.teams.map((team) => team.fifa_code).join("-")}:${group.locked ? 1 : 0}`)
    .join(",");
}

/** Stable identity of the best-thirds selection. Order-insensitive — it's a set, not a ranking. */
export function thirdsSignature(thirds: Team[]): string {
  return thirds
    .map((team) => team.fifa_code)
    .sort()
    .join(",");
}

type DraftBaseline = { groups: string; thirds: string; bracket: string };

/**
 * Last server-confirmed pickem state this session has seen, as one signature
 * per draft slice. Persisted drafts are stamped with the slice signature they
 * were built on (see the *DraftStorage modules); a draft whose stamp no longer
 * matches was based on a server state that has since changed — typically a
 * save from another device — so it's stale and the server wins.
 *
 * Synced from every server response (initial RSC payload, query refetches,
 * mutation responses). Module-level on purpose: it must outlive component
 * mounts, since on SPA re-visits the query cache already carries draft
 * overlays and can't be used to re-derive server truth.
 */
let baseline: DraftBaseline | null = null;

export function syncDraftBaseline(data: UserPickem): void {
  baseline = {
    groups: groupsSignature(data.group_picks),
    thirds: thirdsSignature(data.best_thirds),
    bracket: bracketSignature(data.bracket),
  };
}

/** Seed the baseline only if no server state has been seen yet this session. */
export function initDraftBaseline(data: UserPickem): void {
  if (!baseline) syncDraftBaseline(data);
}

export function getDraftBase(slice: keyof DraftBaseline): string | null {
  return baseline ? baseline[slice] : null;
}
