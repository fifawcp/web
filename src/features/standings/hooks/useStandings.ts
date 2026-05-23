"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchStandings, STANDINGS_QUERY_KEY } from "../api/standings";
import type { StandingRow } from "../types/standings.types";

// Seed the query with `initialData` from the server component so the first
// paint happens without a client fetch. Mirrors `useMatches` / `usePickems`.
export function useStandings(initialData?: StandingRow[]) {
  return useQuery({
    queryKey: STANDINGS_QUERY_KEY,
    queryFn: fetchStandings,
    initialData,
  });
}
