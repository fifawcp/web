"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MATCHES_QUERY_KEY, savePick, type SavePickInput } from "../api/matches";
import type { Match } from "../types/schedule.types";

// Optimistic-only mutation: write the new pick into the cache before the
// network call, roll back on error, do nothing on success.
// The optimistic value already represents the new server state
export function useUpdatePick() {
  const qc = useQueryClient();

  return useMutation<void, Error, SavePickInput, { previous: Match[] | undefined }>({
    mutationFn: savePick,
    onMutate: async ({ matchId, pick }) => {
      // Cancel any existing queries for the matches
      await qc.cancelQueries({ queryKey: MATCHES_QUERY_KEY });
      // Get the previous data
      const previous = qc.getQueryData<Match[]>(MATCHES_QUERY_KEY);

      if (previous) {
        // Update the cache with the new pick
        qc.setQueryData<Match[]>(
          MATCHES_QUERY_KEY,
          previous.map((match) => (match.id === matchId ? { ...match, user_score_pick: pick } : match))
        );
      }

      return { previous };
    },
    // If mutation fails, roll back to the previous data
    onError: (_err, _input, context) => {
      if (context?.previous) qc.setQueryData(MATCHES_QUERY_KEY, context.previous);
    },
  });
}
