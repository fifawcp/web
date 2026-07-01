import type { BracketDraft } from "@/features/pickems/types/pickems.types";

/**
 * Session-scoped persistence for the bracket simulator.
 *
 * Unlike the Pick'ems bracket draft (localStorage, server-synced with a
 * staleness baseline), the simulator is a purely local "what-if" toy: it lives
 * in `sessionStorage` so a user can navigate away and back within the same tab
 * without losing progress, but a fresh tab / session starts from the real
 * bracket again. The stored value is just the user's *override* picks
 * (`BracketDraft`, keyed by knockout match id → fifa_code); the base bracket is
 * always re-derived from the live `/matches` results, so simulated rounds
 * recompute automatically as real results come in.
 *
 * Keyed by userId so two accounts on the same tab don't cross-contaminate;
 * guests fall back to "anonymous".
 */
const KEY_PREFIX = "wcp.bracket.simulator.v1";

export function simulatorStorageKey(userId: string | undefined): string {
  return `${KEY_PREFIX}.${userId ?? "anonymous"}`;
}

export function readSimulatorDraft(userId: string | undefined): BracketDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(simulatorStorageKey(userId));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as BracketDraft;
  } catch {
    return {};
  }
}

export function writeSimulatorDraft(userId: string | undefined, draft: BracketDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(simulatorStorageKey(userId), JSON.stringify(draft));
  } catch {
    // ignore — storage may be unavailable (private mode, quota, etc.)
  }
}

export function clearSimulatorDraft(userId: string | undefined): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(simulatorStorageKey(userId));
  } catch {
    // ignore
  }
}
