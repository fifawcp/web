import { create } from "zustand";

import type { BracketDraft } from "@/features/pickems/types/pickems.types";

import { clearSimulatorDraft, readSimulatorDraft, writeSimulatorDraft } from "../lib/simulatorStorage";

type SimulatorDraftStore = {
  /** `false` until the first `hydrate`. Distinct from `userId` because guests
   *  pass `userId: undefined`, which would otherwise match the initial state and
   *  skip the sessionStorage read on reload. */
  hydrated: boolean;
  userId: string | undefined;
  draft: BracketDraft;
  hydrate: (userId: string | undefined) => void;
  pick: (matchId: number, fifaCode: string) => void;
  clearPick: (matchId: number) => void;
  reset: () => void;
};

/**
 * In-memory mirror of the per-user bracket-simulator draft. Mirrors the Pick'ems
 * `bracketDraft.store`, but persists to `sessionStorage` (see `simulatorStorage`)
 * since the simulator is a per-session local "what-if", not a server-synced
 * commitment. Keyed by userId so multiple accounts on the same tab don't
 * cross-contaminate. `hydrate` reloads from storage when the known userId
 * differs from the store's.
 */
export const useSimulatorDraftStore = create<SimulatorDraftStore>((set, get) => ({
  hydrated: false,
  userId: undefined,
  draft: {},
  hydrate: (userId) => {
    const draft = readSimulatorDraft(userId);
    set({ hydrated: true, userId, draft });
  },
  pick: (matchId, fifaCode) => {
    const next = { ...get().draft, [matchId]: fifaCode };
    writeSimulatorDraft(get().userId, next);
    set({ draft: next });
  },
  clearPick: (matchId) => {
    const next = { ...get().draft };
    delete next[matchId];
    writeSimulatorDraft(get().userId, next);
    set({ draft: next });
  },
  reset: () => {
    clearSimulatorDraft(get().userId);
    set({ draft: {} });
  },
}));
