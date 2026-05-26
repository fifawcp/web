"use client";

import { useQuery } from "@tanstack/react-query";

import { competitionsKey, fetchCompetitions } from "../api/competitions";
import type { Competition } from "../types/competitions.types";

export function useCompetitions(boardId: number, initialData?: Competition[]) {
  return useQuery({
    queryKey: competitionsKey(boardId),
    queryFn: () => fetchCompetitions(boardId),
    initialData,
    enabled: Number.isFinite(boardId),
  });
}
