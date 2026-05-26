"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { competitionsKey, deleteCompetition } from "../api/competitions";
import type { Competition } from "../types/competitions.types";

export function useDeleteCompetition(boardId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (competitionId) => deleteCompetition(boardId, competitionId),
    onSuccess: (_void, competitionId) => {
      const key = competitionsKey(boardId);
      const previous = qc.getQueryData<Competition[]>(key);
      if (previous)
        qc.setQueryData<Competition[]>(
          key,
          previous.filter((c) => c.id !== competitionId)
        );
    },
  });
}
