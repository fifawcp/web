"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AWARDS_QUERY_KEY, saveAwardPicks } from "../api/awards";
import { toPickInputs } from "../lib/awards";
import type { FilledAwardPick, UserAwards } from "../types/awards.types";

/**
 * Save the user's award picks (PUT /awards, replace-all). The input is the
 * local draft (filled picks only); `toPickInputs` maps it to the
 * `{ award_type, player_id }[]` body — skipping any null-player slots, which
 * is what previously crashed when the canonical 4-slot response was sent back
 * verbatim.
 *
 * No optimistic write: the awards page renders from its local draft, not the
 * query cache, so on success we simply replace the cache with the server's
 * authoritative response and let the view re-sync its draft from it.
 */
export function useSaveAwards() {
  const qc = useQueryClient();

  return useMutation<UserAwards, Error, FilledAwardPick[]>({
    mutationFn: (picks) => saveAwardPicks({ picks: toPickInputs(picks) }),
    onSuccess: (data) => {
      qc.setQueryData<UserAwards>(AWARDS_QUERY_KEY, data);
    },
  });
}
