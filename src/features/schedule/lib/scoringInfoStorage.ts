// Whether the "scores count extra time" disclaimer has been shown. Persisted so the
// modal only interrupts the first pick; mirrors the pickems draft-storage guards
// (SSR-safe, swallows private-mode / quota errors).
const KEY = "wcp.schedule.scoringInfoSeen.v1";

export function hasSeenScoringInfo(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markScoringInfoSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // ignore — storage may be unavailable (private mode, quota, etc.)
  }
}
