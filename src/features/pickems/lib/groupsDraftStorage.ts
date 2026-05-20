import type { GroupCode } from "@/shared/types/wcp.types";

/** Ordered FIFA codes per group, e.g. `{ A: ["CAN", "MEX", "JAM", "UZB"], ... }`. */
export type GroupsDraft = Record<GroupCode, string[]>;

const KEY_PREFIX = "wcp.pickems.groupsDraft";

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
