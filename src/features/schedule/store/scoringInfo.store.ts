import { create } from "zustand";

import { hasSeenScoringInfo, markScoringInfoSeen } from "../lib/scoringInfoStorage";

type ScoringInfoState = {
  open: boolean;
  // The pick action to run once the disclaimer is dismissed (open the card's picker).
  pendingProceed: (() => void) | null;
  // Gate a pick behind the one-time disclaimer: first time shows the modal, then runs
  // `proceed`; afterwards `proceed` runs immediately with no interruption.
  requestPick: (proceed: () => void) => void;
  // Acknowledge (any close): remember it was seen, then continue the deferred pick.
  acknowledge: () => void;
};

export const useScoringInfoStore = create<ScoringInfoState>((set, get) => ({
  open: false,
  pendingProceed: null,
  requestPick: (proceed) => {
    if (hasSeenScoringInfo()) {
      proceed();
      return;
    }
    set({ open: true, pendingProceed: proceed });
  },
  acknowledge: () => {
    markScoringInfoSeen();
    const { pendingProceed } = get();
    set({ open: false, pendingProceed: null });
    pendingProceed?.();
  },
}));
