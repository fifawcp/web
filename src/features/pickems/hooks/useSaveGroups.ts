"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useIsomorphicLayoutEffect } from "@/shared/hooks/useIsomorphicLayoutEffect";
import type { GroupCode } from "@/shared/types/wcp.types";

import { PICKEMS_QUERY_KEY, saveGroupPicks, setGroupLock } from "../api/pickems";
import { clearBestThirdsDraft } from "../lib/bestThirdsDraftStorage";
import { readBracketDraft } from "../lib/bracketDraftStorage";
import { clearGroupsDraft, readGroupsDraft, writeGroupsDraft, type GroupsDraft } from "../lib/groupsDraftStorage";
import { useBracketDraftStore } from "../store/bracketDraft.store";
import type { BracketMatchSlot, RankedTeam, ResolvedGroupPick, SaveGroupPicksPayload, SetGroupLockPayload, UserPickem } from "../types/pickems.types";

import { usePickemMutation } from "./usePickemMutation";

function reorderGroup(groups: ResolvedGroupPick[], groupCode: GroupCode, newOrder: RankedTeam[]): ResolvedGroupPick[] {
  return groups.map((group) => (group.group_code === groupCode ? { ...group, teams: newOrder } : group));
}

function payloadFromGroups(groups: ResolvedGroupPick[]): SaveGroupPicksPayload {
  return {
    group_picks: groups.map((group) => ({
      group_code: group.group_code,
      team_fifa_codes: group.teams.map((team) => team.fifa_code) as [string, string, string, string],
    })),
  };
}

function draftFromGroups(groups: ResolvedGroupPick[]): GroupsDraft {
  return Object.fromEntries(groups.map((group) => [group.group_code, group.teams.map((team) => team.fifa_code)])) as GroupsDraft;
}

function applyDraftToGroups(groups: ResolvedGroupPick[], draft: GroupsDraft): ResolvedGroupPick[] {
  return groups.map((group) => {
    const order = draft[group.group_code];

    if (!order || order.length !== group.teams.length) return group;

    const byCode = new Map(group.teams.map((team) => [team.fifa_code, team]));
    const reordered: RankedTeam[] = [];

    for (let i = 0; i < order.length; i += 1) {
      const team = byCode.get(order[i]);
      if (!team) return group; // Draft references an unknown team; bail on this group
      reordered.push({ ...team, position: i + 1 });
    }

    return { ...group, teams: reordered };
  });
}

/**
 * Local-first save for step 1.
 *
 * Drags only update the cache + a per-user localStorage draft. The server is
 * not touched until the user explicitly clicks "Save draft" or "Continue to
 * Step 2". This avoids a burst of PUTs on slow networks where stale responses
 * could fight the user's most recent drag.
 *
 * On mount, any localStorage draft is applied on top of the server's initial
 * state so a refresh / route revisit restores pending work. The draft is
 * cleared once the server confirms a successful save.
 */
export function useSaveGroups(userId: string | undefined) {
  const qc = useQueryClient();
  const tToasts = useTranslations("pickems.toasts");
  const hydratedRef = useRef(false);
  const [lockingGroupCode, setLockingGroupCode] = useState<GroupCode | null>(null);

  const mutation = usePickemMutation<SaveGroupPicksPayload>({
    mutationFn: saveGroupPicks,
    applyOptimistic: (prev) => prev,
    mergeServerResponse: (current, response) => ({
      ...current,
      bracket: response.bracket,
      best_thirds: response.best_thirds,
      progress: response.progress,
      is_locked: response.is_locked,
    }),
    detectCascade: true,
    successMessageKey: "groupsSaved",
  });

  // Hydrate from localStorage once per (userId, mount). Must run before paint:
  // `useHydrated`'s `useSyncExternalStore` snapshot flip would re-render the
  // real content with an un-drafted cache before a plain `useEffect` could
  // patch it, producing a visible flash. useLayoutEffect fires before that
  // re-render's paint.
  //
  // When the pickem is locked, the server is read-only and unsaved drafts can
  // never sync. Show what the user actually committed, not stale local edits.
  useIsomorphicLayoutEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const cache = qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY);
    if (!cache || cache.is_locked) return;

    const draft = readGroupsDraft(userId);
    if (!draft) return;

    qc.setQueryData<UserPickem>(PICKEMS_QUERY_KEY, { ...cache, group_picks: applyDraftToGroups(cache.group_picks, draft) });
  }, [qc, userId]);

  // Locking persists order AND sets locked=true in one round-trip; unlocking only flips
  // the flag. Server response replaces downstream slices so any cascade reaches the cache.
  const lockMutation = usePickemMutation<SetGroupLockPayload>({
    mutationFn: setGroupLock,
    applyOptimistic: (prev, input) => ({
      ...prev,
      group_picks: prev.group_picks.map((g) => (g.group_code === input.group_code ? { ...g, locked: input.locked } : g)),
    }),
    mergeServerResponse: (current, response) => ({
      ...current,
      group_picks: response.group_picks,
      bracket: response.bracket,
      best_thirds: response.best_thirds,
      progress: response.progress,
      is_locked: response.is_locked,
    }),
    detectCascade: true,
  });

  const reorder = useCallback(
    (groupCode: GroupCode, newOrder: RankedTeam[]) => {
      const prev = qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY);
      if (!prev) return;
      // UI already disables drag on locked groups; this guard catches the keyboard
      // path and any future code that bypasses the disabled prop.
      const target = prev.group_picks.find((g) => g.group_code === groupCode);
      if (target?.locked) return;
      const nextGroups = reorderGroup(prev.group_picks, groupCode, newOrder);

      // Mirror the backend cascade: a group reorder shuffles which teams
      // advance to thirds and bracket, so FULLY wipe both downstream layers
      // — best_thirds emptied, and every bracket slot's home/away/picked
      // cleared. The next save returns a fresh server-projected bracket.
      const hadThirds = prev.best_thirds.length > 0;
      const hadBracketPicks = prev.bracket.some((slot) => slot.picked_team !== null);
      const hadBracketDraft = Object.keys(readBracketDraft(userId)).length > 0;
      const userWork = hadThirds || hadBracketPicks || hadBracketDraft;

      const clearedBracket: BracketMatchSlot[] = prev.bracket.map((slot) => ({ ...slot, home_team: null, away_team: null, picked_team: null }));

      qc.setQueryData<UserPickem>(PICKEMS_QUERY_KEY, {
        ...prev,
        group_picks: nextGroups,
        best_thirds: [],
        bracket: clearedBracket,
      });

      writeGroupsDraft(userId, draftFromGroups(nextGroups));
      if (hadThirds) clearBestThirdsDraft(userId);
      // Reset clears both localStorage and the in-memory zustand draft. Calling
      // `clearBracketDraft(userId)` directly would leave the store stale, so a
      // later navigation to step 3 would re-render the old picks until reload.
      if (hadBracketDraft) useBracketDraftStore.getState().reset();

      if (userWork) toast.info(tToasts("groupsChangedReset"));
    },
    [qc, userId, tToasts]
  );

  /** Fire-and-forget save. Used by the "Save draft" button. */
  const saveDraft = useCallback(() => {
    const current = qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY);
    if (!current) return;

    mutation.mutate(payloadFromGroups(current.group_picks), {
      onSuccess: () => clearGroupsDraft(userId),
    });
  }, [mutation, qc, userId]);

  /** Awaitable save. Used by "Continue" so we don't navigate before the server has accepted the new state. */
  const saveAndAwait = useCallback(async () => {
    const current = qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY);
    if (!current) return;

    await mutation.mutateAsync(payloadFromGroups(current.group_picks));
    clearGroupsDraft(userId);
  }, [mutation, qc, userId]);

  const toggleLock = useCallback(
    async (groupCode: GroupCode) => {
      const current = qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY);
      if (!current) return;
      const group = current.group_picks.find((g) => g.group_code === groupCode);
      if (!group) return;

      const nextLocked = !group.locked;
      const teamCodes = group.teams.map((t) => t.fifa_code) as [string, string, string, string];

      setLockingGroupCode(groupCode);
      try {
        await lockMutation.mutateAsync({ group_code: groupCode, locked: nextLocked, team_fifa_codes: teamCodes });
      } finally {
        setLockingGroupCode(null);
      }

      // Locking makes the server state authoritative for this group; drop its draft entry.
      if (nextLocked) {
        const draft = readGroupsDraft(userId);
        if (draft && groupCode in draft) {
          const rest = { ...draft };
          delete rest[groupCode];
          const remaining = Object.keys(rest);
          if (remaining.length === 0) {
            clearGroupsDraft(userId);
          } else {
            writeGroupsDraft(userId, rest as GroupsDraft);
          }
        }
      }
    },
    [qc, lockMutation, userId]
  );

  return {
    reorder,
    saveDraft,
    saveAndAwait,
    toggleLock,
    lockingGroupCode,
    isSaving: mutation.isPending || lockMutation.isPending,
    isError: mutation.isError || lockMutation.isError,
    isSuccess: mutation.isSuccess,
  };
}
