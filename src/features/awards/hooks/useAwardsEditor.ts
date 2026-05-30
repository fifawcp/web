"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { translateApiError } from "@/shared/lib/api/errors";

import { AWARDS_QUERY_KEY } from "../api/awards";
import { canonicalSlots, filledPicks, setSlot } from "../lib/awards";
import type { AwardType, Player, UserAwards } from "../types/awards.types";

import { useSaveAwards } from "./useSaveAwards";

/**
 * Award editing against the React Query cache. Edits are session-local
 * (they live in the cache, surviving in-app navigation) and only reach the
 * server on an explicit "Save".
 *
 * There is intentionally **no** localStorage draft: with only four picks the
 * persistence wasn't worth the cross-device hazard it introduced (a stale
 * local draft on one device would mask picks saved from another). A full page
 * load always reseeds the cache from the server (`initialData`), so the page
 * reflects the authoritative state.
 */
export function useAwardsEditor() {
  const qc = useQueryClient();
  const t = useTranslations("awards");
  const tApiErrors = useTranslations("apiErrors");
  const mutation = useSaveAwards();

  const writeSlot = useCallback(
    (awardType: AwardType, player: Player | null) => {
      const prev = qc.getQueryData<UserAwards>(AWARDS_QUERY_KEY);
      if (!prev || prev.is_locked) return;
      const picks = setSlot(prev.picks, awardType, player);
      qc.setQueryData<UserAwards>(AWARDS_QUERY_KEY, { ...prev, picks, progress: { ...prev.progress, completed: filledPicks(picks).length } });
    },
    [qc]
  );

  const select = useCallback((awardType: AwardType, player: Player) => writeSlot(awardType, player), [writeSlot]);
  const clear = useCallback((awardType: AwardType) => writeSlot(awardType, null), [writeSlot]);

  const reset = useCallback(() => {
    const prev = qc.getQueryData<UserAwards>(AWARDS_QUERY_KEY);
    if (!prev || prev.is_locked) return;
    qc.setQueryData<UserAwards>(AWARDS_QUERY_KEY, { ...prev, picks: canonicalSlots([]), progress: { ...prev.progress, completed: 0 } });
  }, [qc]);

  const save = useCallback(async () => {
    const current = qc.getQueryData<UserAwards>(AWARDS_QUERY_KEY);
    if (!current) return;
    try {
      await mutation.mutateAsync(filledPicks(current.picks));
      toast.success(t("saved"));
    } catch (err) {
      toast.error(translateApiError(err, tApiErrors));
    }
  }, [mutation, qc, t, tApiErrors]);

  return { select, clear, reset, save, isSaving: mutation.isPending };
}
