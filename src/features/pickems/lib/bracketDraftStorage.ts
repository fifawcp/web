import type { BracketDraft } from "../types/pickems.types";

import { getDraftBase } from "./draftBaseline";

// v2: draft wrapped in a `{ base, data }` envelope, where `base` is the
// signature of the server state the draft was built on (see `draftBaseline`).
// The bump makes any un-stamped draft fall out of scope — those carry no
// recency information, so a stale one could clobber picks submitted from
// another device.
const KEY_PREFIX = "wcp.pickems.bracketDraft.v2";
const LEGACY_KEY_PREFIX = "wcp.pickems.bracketDraft";

export function bracketDraftKey(userId: string | undefined): string {
  return `${KEY_PREFIX}.${userId ?? "anonymous"}`;
}

export function readBracketDraft(userId: string | undefined): BracketDraft {
  if (typeof window === "undefined") return {};
  try {
    window.localStorage.removeItem(`${LEGACY_KEY_PREFIX}.${userId ?? "anonymous"}`);
    const raw = window.localStorage.getItem(bracketDraftKey(userId));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const { base, data } = parsed as { base?: unknown; data?: unknown };
    if (typeof base !== "string" || !data || typeof data !== "object") return {};
    // Built on a server state that has since changed (e.g. submitted from
    // another device) — the draft is stale and the server wins.
    const currentBase = getDraftBase("bracket");
    if (currentBase === null) return {};
    if (base !== currentBase) {
      window.localStorage.removeItem(bracketDraftKey(userId));
      return {};
    }
    return data as BracketDraft;
  } catch {
    return {};
  }
}

export function writeBracketDraft(userId: string | undefined, draft: BracketDraft): void {
  if (typeof window === "undefined") return;
  const base = getDraftBase("bracket");
  if (base === null) return; // no server state seen yet — nothing to stamp against
  try {
    window.localStorage.setItem(bracketDraftKey(userId), JSON.stringify({ base, data: draft }));
  } catch {
    // ignore — storage may be unavailable (private mode, quota, etc.)
  }
}

export function clearBracketDraft(userId: string | undefined): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(bracketDraftKey(userId));
  } catch {
    // ignore
  }
}
