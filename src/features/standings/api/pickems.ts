import { api } from "@/shared/lib/api/client";

import type { PickemState } from "../types/standings.types";

export const PICKEMS_QUERY_KEY = ["pickems"] as const;
export const PICKEMS_CACHE_TAG = "pickems";

/**
 * Returns the current user's pickem state. Returns null on any failure so the
 * Standings page can still render the guest view (no comparison).
 */
export async function fetchPickems(): Promise<PickemState | null> {
  const res = await api.get<PickemState>("/api/pickems", { authenticated: true });
  if (!res.success || !res.data) return null;
  return res.data;
}
