"use client";

import { useCallback } from "react";

import { saveBracketPicks } from "../api/pickems";
import type { BracketDraft, SaveBracketPicksPayload } from "../types/pickems.types";

import { usePickemMutation } from "./usePickemMutation";

export function useSubmitBracket() {
  const mutation = usePickemMutation<SaveBracketPicksPayload>({
    mutationFn: saveBracketPicks,
    applyOptimistic: (prev, input) => {
      const picksById = new Map(input.bracket_picks.map((p) => [p.match_id, p.team_fifa_code] as const));
      return {
        ...prev,
        bracket: prev.bracket.map((slot) => {
          const code = picksById.get(slot.match_id);
          if (!code) return slot;
          const picked = slot.home_team?.fifa_code === code ? slot.home_team : slot.away_team?.fifa_code === code ? slot.away_team : null;
          return picked ? { ...slot, picked_team: picked } : slot;
        }),
      };
    },
    detectCascade: false,
    successMessageKey: "bracketSubmitted",
    errorMessageKey: "submitFailed",
  });

  const submit = useCallback(
    (draft: BracketDraft) => {
      const bracket_picks = Object.entries(draft).map(([matchId, fifaCode]) => ({
        match_id: Number(matchId),
        team_fifa_code: fifaCode,
      }));
      mutation.mutate({ bracket_picks });
    },
    [mutation]
  );

  return { submit, isSubmitting: mutation.isPending, isSuccess: mutation.isSuccess, isError: mutation.isError };
}
