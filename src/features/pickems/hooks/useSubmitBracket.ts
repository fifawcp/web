"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { saveBracketPicks } from "../api/pickems";
import { TOTAL_BRACKET_PICKS } from "../lib/bracketStructure";
import type { BracketMatchSlot, SaveBracketPicksPayload } from "../types/pickems.types";

import { usePickemMutation } from "./usePickemMutation";

export function useSubmitBracket() {
  const tToasts = useTranslations("pickems.toasts");
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

  // Build the payload from the *projected* board — the same array the Submit
  // gate counts — not the local draft. The draft only holds this device's edits
  // and omits picks that resolve from the server's committed state, so sending
  // it can ship <32 picks while the UI reads 32/32 (backend rejects on len=32).
  const submit = useCallback(
    (projected: BracketMatchSlot[]) => {
      const bracket_picks = projected.filter((slot) => slot.picked_team).map((slot) => ({ match_id: slot.match_id, team_fifa_code: slot.picked_team!.fifa_code }));
      // Defense-in-depth: the backend requires exactly 32 picks. The Submit button
      // is already gated on a full board, but never fire an incomplete request —
      // catch it here with a clear message instead of a generic "submit failed".
      if (bracket_picks.length !== TOTAL_BRACKET_PICKS) {
        toast.error(tToasts("pickAllBracketFirst"));
        return;
      }
      mutation.mutate({ bracket_picks });
    },
    [mutation, tToasts]
  );

  return { submit, isSubmitting: mutation.isPending, isSuccess: mutation.isSuccess, isError: mutation.isError };
}
