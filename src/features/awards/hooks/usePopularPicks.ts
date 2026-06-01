"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPopularPicks, POPULAR_PICKS_LIMIT, POPULAR_QUERY_KEY } from "../api/awards";

/**
 * Shared popular-picks fetch. One request returns every award's ranking, so the
 * four pickers reuse a single cached result. Gated on `enabled` so it only runs
 * once a picker is opened.
 */
export function usePopularPicks(enabled: boolean) {
  return useQuery({
    queryKey: POPULAR_QUERY_KEY,
    queryFn: ({ signal }) => fetchPopularPicks(POPULAR_PICKS_LIMIT, signal),
    enabled,
    staleTime: 300_000,
  });
}
