"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useIsomorphicLayoutEffect } from "@/shared/hooks/useIsomorphicLayoutEffect";

import { PICKEMS_QUERY_KEY } from "../api/pickems";
import { initDraftBaseline } from "../lib/draftBaseline";
import type { UserPickem } from "../types/pickems.types";

/**
 * Seeds the draft-staleness baseline from the first server snapshot of the
 * session. Must be the first draft hook PickemsView calls: the storage reads
 * in useBracketDraft / useSaveGroups / useSaveBestThirds validate their drafts
 * against this baseline, and layout effects run in declaration order. On the
 * first mount the query cache is still the untouched server payload; later
 * mounts are no-ops (the baseline then tracks fetch/mutation responses).
 */
export function useDraftBaseline(initialData: UserPickem): void {
  const qc = useQueryClient();

  useIsomorphicLayoutEffect(() => {
    initDraftBaseline(qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY) ?? initialData);
  }, [qc, initialData]);
}
