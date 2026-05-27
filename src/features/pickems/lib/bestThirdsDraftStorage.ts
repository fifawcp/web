/** Ordered FIFA codes the user has marked as their best 3rd-place picks. */
export type BestThirdsDraft = string[];

const KEY_PREFIX = "wcp.pickems.bestThirdsDraft";

export function bestThirdsDraftKey(userId: string | undefined): string {
  return `${KEY_PREFIX}.${userId ?? "anonymous"}`;
}

export function readBestThirdsDraft(userId: string | undefined): BestThirdsDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(bestThirdsDraftKey(userId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((s) => typeof s === "string") ? (parsed as BestThirdsDraft) : null;
  } catch {
    return null;
  }
}

export function writeBestThirdsDraft(userId: string | undefined, draft: BestThirdsDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(bestThirdsDraftKey(userId), JSON.stringify(draft));
  } catch {
    // ignore — storage may be unavailable (private mode, quota, etc.)
  }
}

export function clearBestThirdsDraft(userId: string | undefined): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(bestThirdsDraftKey(userId));
  } catch {
    // ignore
  }
}
