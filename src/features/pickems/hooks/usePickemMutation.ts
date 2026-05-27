"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PICKEMS_QUERY_KEY } from "../api/pickems";
import { countClearedPicks } from "../lib/diffInvalidation";
import type { UserPickem } from "../types/pickems.types";

type Options<TInput> = {
  mutationFn: (input: TInput) => Promise<UserPickem>;
  applyOptimistic: (prev: UserPickem, input: TInput) => UserPickem;
  /**
   * How to merge the server response back into the cache. Default replaces the
   * whole record. For debounced / optimistic flows that race the server (groups,
   * best-thirds), override this to keep the slice the user is actively editing
   * and only apply the slices the server "owns" (e.g. bracket projection).
   */
  mergeServerResponse?: (current: UserPickem, response: UserPickem) => UserPickem;
  detectCascade?: boolean;
  errorMessageKey?: "saveFailed" | "submitFailed";
  successMessageKey?: "groupsSaved" | "thirdsSaved" | "bracketSubmitted";
};

export function usePickemMutation<TInput>({
  mutationFn,
  applyOptimistic,
  mergeServerResponse,
  detectCascade = false,
  errorMessageKey = "saveFailed",
  successMessageKey,
}: Options<TInput>) {
  const qc = useQueryClient();
  const t = useTranslations("pickems.toasts");

  return useMutation<UserPickem, Error, TInput, { previous: UserPickem | undefined }>({
    mutationFn,
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: PICKEMS_QUERY_KEY });
      const previous = qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY);
      if (previous) qc.setQueryData<UserPickem>(PICKEMS_QUERY_KEY, applyOptimistic(previous, input));
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(PICKEMS_QUERY_KEY, ctx.previous);
      toast.error(t(errorMessageKey));
    },
    onSuccess: (response, _input, ctx) => {
      const current = qc.getQueryData<UserPickem>(PICKEMS_QUERY_KEY);
      if (current) {
        const merged = mergeServerResponse ? mergeServerResponse(current, response) : response;
        qc.setQueryData(PICKEMS_QUERY_KEY, merged);
      } else {
        qc.setQueryData(PICKEMS_QUERY_KEY, response);
      }

      if (detectCascade) {
        const cleared = countClearedPicks(ctx?.previous?.bracket, response.bracket);
        if (cleared > 0) toast.warning(t("picksClearedByGroupChange", { n: cleared }));
      }

      if (successMessageKey) toast.success(t(successMessageKey));
    },
  });
}
