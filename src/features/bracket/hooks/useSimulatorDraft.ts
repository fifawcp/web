"use client";

import { useIsomorphicLayoutEffect } from "@/shared/hooks/useIsomorphicLayoutEffect";

import { useSimulatorDraftStore } from "../store/simulatorDraft.store";

/**
 * Subscribes to the simulator-draft store and lazily hydrates it from
 * sessionStorage when the active userId changes. Mirrors `useBracketDraft`;
 * runs before paint so the restored draft is present on the first render and
 * the bracket doesn't flash the real (un-simulated) tree.
 */
export function useSimulatorDraft(userId: string | undefined) {
  const draft = useSimulatorDraftStore((s) => s.draft);
  const hydrated = useSimulatorDraftStore((s) => s.hydrated);
  const storedUserId = useSimulatorDraftStore((s) => s.userId);
  const hydrate = useSimulatorDraftStore((s) => s.hydrate);
  const pick = useSimulatorDraftStore((s) => s.pick);
  const clearPick = useSimulatorDraftStore((s) => s.clearPick);
  const reset = useSimulatorDraftStore((s) => s.reset);

  // Hydrate on first mount, and again whenever the account changes. The
  // `!hydrated` guard is essential for guests: their `userId` is `undefined`,
  // which equals the store's initial `userId`, so the id check alone would never
  // fire and the sessionStorage draft would never load on reload.
  useIsomorphicLayoutEffect(() => {
    if (!hydrated || storedUserId !== userId) hydrate(userId);
  }, [hydrated, storedUserId, userId, hydrate]);

  const isHydrated = hydrated && storedUserId === userId;

  return { draft, pick, clearPick, reset, isHydrated };
}
