import { create } from "zustand";

import { clearBracketDraft, readBracketDraft, writeBracketDraft } from "../lib/bracketDraftStorage";
import type { BracketDraft } from "../types/pickems.types";

type BracketDraftStore = {
  userId: string | undefined;
  draft: BracketDraft;
  hydrate: (userId: string | undefined) => void;
  pick: (matchId: number, fifaCode: string) => void;
  clearPick: (matchId: number) => void;
  replaceDraft: (draft: BracketDraft) => void;
  reset: () => void;
};

/**
 * In-memory mirror of the per-user bracket draft. Storage is keyed by userId
 * (see `bracketDraftStorage`) so multiple accounts on the same browser don't
 * cross-contaminate. `hydrate` is what the consuming hook calls when the
 * known userId differs from the store's, to reload from localStorage.
 */
export const useBracketDraftStore = create<BracketDraftStore>((set, get) => ({
  userId: undefined,
  draft: {},
  hydrate: (userId) => {
    const draft = readBracketDraft(userId);
    set({ userId, draft });
  },
  pick: (matchId, fifaCode) => {
    const next = { ...get().draft, [matchId]: fifaCode };
    writeBracketDraft(get().userId, next);
    set({ draft: next });
  },
  clearPick: (matchId) => {
    const next = { ...get().draft };
    delete next[matchId];
    writeBracketDraft(get().userId, next);
    set({ draft: next });
  },
  replaceDraft: (draft) => {
    writeBracketDraft(get().userId, draft);
    set({ draft });
  },
  reset: () => {
    clearBracketDraft(get().userId);
    set({ draft: {} });
  },
}));
