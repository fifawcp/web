import type { GroupCode } from "@/shared/types/wcp.types";

/** Per-group draft entry: the ordered FIFA codes plus the user's lock state. */
export type GroupDraftEntry = { order: string[]; locked: boolean };

/** Pending step-1 state per group, e.g. `{ A: { order: ["CAN", "MEX", ...], locked: true }, ... }`. */
export type GroupsDraft = Record<GroupCode, GroupDraftEntry>;

// v2: entries changed from `string[]` (order only) to `{ order, locked }`. The bump
// makes any old array-shaped draft fall out of scope instead of being mis-parsed.
const KEY_PREFIX = "wcp.pickems.groupsDraft.v2";

export function groupsDraftKey(userId: string | undefined): string {
  return `${KEY_PREFIX}.${userId ?? "anonymous"}`;
}

export function readGroupsDraft(userId: string | undefined): GroupsDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(groupsDraftKey(userId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as GroupsDraft) : null;
  } catch {
    return null;
  }
}

export function writeGroupsDraft(userId: string | undefined, draft: GroupsDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(groupsDraftKey(userId), JSON.stringify(draft));
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
