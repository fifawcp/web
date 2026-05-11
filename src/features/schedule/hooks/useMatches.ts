"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMatches, MATCHES_QUERY_KEY } from "../api/matches";
import type { Match } from "../types/schedule.types";

// Seed the query with `initialData` from the server component so the first paint happens without a client fetch
export function useMatches(initialData?: Match[]) {
  return useQuery({
    queryKey: MATCHES_QUERY_KEY,
    queryFn: fetchMatches,
    initialData,
  });
}
