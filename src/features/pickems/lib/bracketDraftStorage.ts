import type { BracketDraft } from "../types/pickems.types";

const KEY_PREFIX = "wcp.pickems.bracketDraft";

export function bracketDraftKey(userId: string | undefined): string {
  return `${KEY_PREFIX}.${userId ?? "anonymous"}`;
}

export function readBracketDraft(userId: string | undefined): BracketDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(bracketDraftKey(userId));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as BracketDraft) : {};
  } catch {
    return {};
  }
}

export function writeBracketDraft(userId: string | undefined, draft: BracketDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(bracketDraftKey(userId), JSON.stringify(draft));
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
