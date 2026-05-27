"use client";

import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useIsomorphicLayoutEffect } from "@/shared/hooks/useIsomorphicLayoutEffect";
import type { Team } from "@/shared/types/wcp.types";

import { PICKEMS_QUERY_KEY, saveBestThirds } from "../api/pickems";
import { clearBestThirdsDraft, readBestThirdsDraft, writeBestThirdsDraft } from "../lib/bestThirdsDraftStorage";
import { readBracketDraft } from "../lib/bracketDraftStorage";
import { useBracketDraftStore } from "../store/bracketDraft.store";
import type { BracketMatchSlot, SaveBestThirdsPayload, UserPickem } from "../types/pickems.types";

import { usePickemMutation } from "./usePickemMutation";

const REQUIRED = 8;

function applyDraft(cache: UserPickem, fifaCodes: string[]): UserPickem {
  // Resolve each draft code against the *current* 3rd-place teams. If a team
  // has since been moved to a different position in step 1, drop it — keeping
  // it would leave the selection state out of sync with the candidate grid.
  const thirdPlaceByCode = new Map(
    cache.group_picks
      .flatMap((group) => group.teams)
      .filter((team) => team.position === 3)
      .map((team) => [team.fifa_code, team] as const)
  );
  const resolved: Team[] = [];
  for (const code of fifaCodes) {
    const team = thirdPlaceByCode.get(code);
    if (team) resolved.push(team);
  }
  return { ...cache, best_thirds: resolved };
}

/**
 * Local-first save for step 2 (same model as step 1 and the bracket).
 *
 * Toggles only update the cache + a per-user localStorage draft. The server is
 * not touched until "Continue to Step 3" (or a future Save Draft button) fires
 * the awaitable save. On mount, the localStorage draft is layered on top of
 * the server's initial state so reloads / route revisits restore pending work.
 */
export function useSaveBestThirds(userId: string | undefined) {
  const qc = useQueryClient();
  const tToasts = useTranslations("pickems.toasts");
  const hydratedRef = useRef(false);

  const mutation = usePickemMutation<SaveBestThirdsPayload>({
    mutationFn: saveBestThirds,
    applyOptimistic: (prev) => prev,
    mergeServerResponse: (current, response) => ({
      ...current,
      // Keep user's current `best_thirds` — they may have toggled more since this save fired.
      group_picks: response.group_picks,
      bracket: response.bracket,
      progress: response.progress,
      is_locked: response.is_locked,
    }),
    detectCascade: true,
    successMessageKey: "thirdsSaved",
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
    const draft = readBestThirdsDraft(userId);
    if (!draft) return;
    const next = applyDraft(cache, draft);
    qc.setQueryData<UserPickem>(PICKEMS_QUERY_KEY, next);

    // If applyDraft dropped any stale codes (e.g. user reordered groups between
    // sessions), persist the cleaned list so we don't re-filter on next load.
    if (next.best_thirds.length !== draft.length) {
      if (next.best_thirds.length === 0) clearBestThirdsDraft(userId);
      else
        writeBestThirdsDraft(
          userId,
          next.best_thirds.map((team) => team.fifa_code)
        );
    }
  }, [qc, userId]);

  const toggle = useCallback(
    (team: Team) => {
      const prev = qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY);
      if (!prev) return;

      const isSelected = prev.best_thirds.some((t) => t.fifa_code === team.fifa_code);
      let next: Team[];
      if (isSelected) {
        next = prev.best_thirds.filter((t) => t.fifa_code !== team.fifa_code);
      } else if (prev.best_thirds.length < REQUIRED) {
        next = [...prev.best_thirds, team];
      } else {
        return; // already at max
      }

      // Mirror the backend cascade: any thirds change invalidates the bracket
      // (R32 slots get reshuffled by which 8 third-place teams advance), so
      // FULLY wipe the bracket — home/away/picked all cleared. The next save
      // (triggered by "Continue") re-fetches a fresh server-projected bracket.
      const hadBracketPicks = prev.bracket.some((slot) => slot.picked_team !== null);
      const hadBracketDraft = Object.keys(readBracketDraft(userId)).length > 0;
      const userWork = hadBracketPicks || hadBracketDraft;

      const clearedBracket: BracketMatchSlot[] = prev.bracket.map((slot) => ({ ...slot, home_team: null, away_team: null, picked_team: null }));

      qc.setQueryData<UserPickem>(PICKEMS_QUERY_KEY, { ...prev, best_thirds: next, bracket: clearedBracket });
      writeBestThirdsDraft(
        userId,
        next.map((t) => t.fifa_code)
      );
      // Reset clears both localStorage and the in-memory zustand draft. Calling
      // `clearBracketDraft(userId)` directly would leave the store stale, so a
      // later navigation to step 3 would re-render the old picks until reload.
      if (hadBracketDraft) useBracketDraftStore.getState().reset();

      if (userWork) toast.info(tToasts("thirdsChangedReset"));
    },
    [qc, userId, tToasts]
  );

  const saveDraft = useCallback(() => {
    const current = qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY);
    if (!current || current.best_thirds.length !== REQUIRED) return;
    mutation.mutate({ team_fifa_codes: current.best_thirds.map((t) => t.fifa_code) }, { onSuccess: () => clearBestThirdsDraft(userId) });
  }, [mutation, qc, userId]);

  const saveAndAwait = useCallback(async () => {
    const current = qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY);
    if (!current || current.best_thirds.length !== REQUIRED) return;
    await mutation.mutateAsync({ team_fifa_codes: current.best_thirds.map((t) => t.fifa_code) });
    clearBestThirdsDraft(userId);
  }, [mutation, qc, userId]);

  return {
    toggle,
    saveDraft,
    saveAndAwait,
    isSaving: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  };
}

export const BEST_THIRDS_REQUIRED_COUNT = REQUIRED;
