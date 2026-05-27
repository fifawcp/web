"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { competitionsKey, createCompetition } from "../api/competitions";
import type { Competition, CreateCompetitionInput } from "../types/competitions.types";

export function useCreateCompetition(boardId: number) {
  const qc = useQueryClient();
  return useMutation<Competition, Error, CreateCompetitionInput>({
    mutationFn: (input) => createCompetition(boardId, input),
    onSuccess: (created) => {
      const key = competitionsKey(boardId);
      const previous = qc.getQueryData<Competition[]>(key);
      qc.setQueryData<Competition[]>(key, previous ? [...previous, created] : [created]);
    },
  });
}
