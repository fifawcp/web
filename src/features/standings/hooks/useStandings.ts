"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchStandings, STANDINGS_QUERY_KEY } from "../api/standings";
import type { StandingRow } from "../types/standings.types";

/**
 * 60 s matches the server's `revalidate: 60` in `app/standings/page.tsx`.
 * Without this, TanStack Query treats the server-seeded `initialData` as
 * instantly stale and refetches on mount — wasted round-trip when the
 * RSC just handed us fresh data.
 */
const STALE_TIME_MS = 60_000;

// Seed the query with `initialData` from the server component so the first
// paint happens without a client fetch. Mirrors `useMatches` / `usePickems`.
export function useStandings(initialData?: StandingRow[]) {
  return useQuery({
    queryKey: STANDINGS_QUERY_KEY,
    queryFn: fetchStandings,
    initialData,
    staleTime: STALE_TIME_MS,
  });
}
