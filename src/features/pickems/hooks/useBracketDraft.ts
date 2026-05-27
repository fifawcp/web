"use client";

import { useIsomorphicLayoutEffect } from "@/shared/hooks/useIsomorphicLayoutEffect";

import { useBracketDraftStore } from "../store/bracketDraft.store";

/**
 * Subscribes to the bracket-draft store and lazily hydrates it from
 * localStorage when the active userId changes. Must run before paint:
 * `useHydrated`'s `useSyncExternalStore` snapshot flip would re-render the
 * bracket with an empty draft before a plain `useEffect` could populate it,
 * producing a visible flash on initial load.
 */
export function useBracketDraft(userId: string | undefined) {
  const draft = useBracketDraftStore((s) => s.draft);
  const storedUserId = useBracketDraftStore((s) => s.userId);
  const hydrate = useBracketDraftStore((s) => s.hydrate);
  const pick = useBracketDraftStore((s) => s.pick);
  const clearPick = useBracketDraftStore((s) => s.clearPick);
  const replaceDraft = useBracketDraftStore((s) => s.replaceDraft);
  const reset = useBracketDraftStore((s) => s.reset);

  useIsomorphicLayoutEffect(() => {
    if (storedUserId !== userId) hydrate(userId);
  }, [storedUserId, userId, hydrate]);

  const isHydrated = storedUserId === userId;

  return { draft, pick, clearPick, replaceDraft, reset, isHydrated };
}
