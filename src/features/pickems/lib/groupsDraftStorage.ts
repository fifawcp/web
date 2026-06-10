import type { GroupCode } from "@/shared/types/wcp.types";

import { getDraftBase } from "./draftBaseline";

/** Per-group draft entry: the ordered FIFA codes plus the user's lock state. */
export type GroupDraftEntry = { order: string[]; locked: boolean };

/** Pending step-1 state per group, e.g. `{ A: { order: ["CAN", "MEX", ...], locked: true }, ... }`. */
export type GroupsDraft = Record<GroupCode, GroupDraftEntry>;

// v3: draft wrapped in a `{ base, data }` envelope, where `base` is the
// signature of the server state the draft was built on (see `draftBaseline`).
// The bump makes any un-stamped draft fall out of scope — those carry no
// recency information, so a stale one could clobber picks submitted from
// another device.
const KEY_PREFIX = "wcp.pickems.groupsDraft.v3";
const LEGACY_KEY_PREFIXES = ["wcp.pickems.groupsDraft.v2", "wcp.pickems.groupsDraft"];

export function groupsDraftKey(userId: string | undefined): string {
  return `${KEY_PREFIX}.${userId ?? "anonymous"}`;
}

export function readGroupsDraft(userId: string | undefined): GroupsDraft | null {
  if (typeof window === "undefined") return null;
  try {
    for (const prefix of LEGACY_KEY_PREFIXES) window.localStorage.removeItem(`${prefix}.${userId ?? "anonymous"}`);
    const raw = window.localStorage.getItem(groupsDraftKey(userId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { base, data } = parsed as { base?: unknown; data?: unknown };
    if (typeof base !== "string" || !data || typeof data !== "object") return null;
    // Built on a server state that has since changed (e.g. saved from another
    // device) — the draft is stale and the server wins.
    const currentBase = getDraftBase("groups");
    if (currentBase === null) return null;
    if (base !== currentBase) {
      window.localStorage.removeItem(groupsDraftKey(userId));
      return null;
    }
    return data as GroupsDraft;
  } catch {
    return null;
  }
}

export function writeGroupsDraft(userId: string | undefined, draft: GroupsDraft): void {
  if (typeof window === "undefined") return;
  const base = getDraftBase("groups");
  if (base === null) return; // no server state seen yet — nothing to stamp against
  try {
    window.localStorage.setItem(groupsDraftKey(userId), JSON.stringify({ base, data: draft }));
  } catch {
    // ignore — storage may be unavailable (private mode, quota, etc.)
  }
}

export function clearGroupsDraft(userId: string | undefined): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(groupsDraftKey(userId));
  } catch {
    // ignore
  }
}
