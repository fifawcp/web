"use client";

import { useQuery } from "@tanstack/react-query";

import { AWARDS_QUERY_KEY, fetchAwards } from "../api/awards";
import type { UserAwards } from "../types/awards.types";

/** Client read of the user's awards, seeded from the server-rendered RSC. */
export function useAwards(initialData?: UserAwards) {
  return useQuery({
    queryKey: AWARDS_QUERY_KEY,
    queryFn: fetchAwards,
    initialData,
  });
}
