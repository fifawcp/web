import { getDraftBase } from "./draftBaseline";

/** Ordered FIFA codes the user has marked as their best 3rd-place picks. */
export type BestThirdsDraft = string[];

// v2: draft wrapped in a `{ base, data }` envelope, where `base` is the
// signature of the server state the draft was built on (see `draftBaseline`).
// The bump makes any un-stamped draft fall out of scope — those carry no
// recency information, so a stale one could clobber picks submitted from
// another device.
const KEY_PREFIX = "wcp.pickems.bestThirdsDraft.v2";
const LEGACY_KEY_PREFIX = "wcp.pickems.bestThirdsDraft";

export function bestThirdsDraftKey(userId: string | undefined): string {
  return `${KEY_PREFIX}.${userId ?? "anonymous"}`;
}

export function readBestThirdsDraft(userId: string | undefined): BestThirdsDraft | null {
  if (typeof window === "undefined") return null;
  try {
    window.localStorage.removeItem(`${LEGACY_KEY_PREFIX}.${userId ?? "anonymous"}`);
    const raw = window.localStorage.getItem(bestThirdsDraftKey(userId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { base, data } = parsed as { base?: unknown; data?: unknown };
    if (typeof base !== "string" || !Array.isArray(data) || !data.every((s) => typeof s === "string")) return null;
    // Built on a server state that has since changed (e.g. saved from another
    // device) — the draft is stale and the server wins.
    const currentBase = getDraftBase("thirds");
    if (currentBase === null) return null;
    if (base !== currentBase) {
      window.localStorage.removeItem(bestThirdsDraftKey(userId));
      return null;
    }
    return data as BestThirdsDraft;
  } catch {
    return null;
  }
}

export function writeBestThirdsDraft(userId: string | undefined, draft: BestThirdsDraft): void {
  if (typeof window === "undefined") return;
  const base = getDraftBase("thirds");
  if (base === null) return; // no server state seen yet — nothing to stamp against
  try {
    window.localStorage.setItem(bestThirdsDraftKey(userId), JSON.stringify({ base, data: draft }));
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
