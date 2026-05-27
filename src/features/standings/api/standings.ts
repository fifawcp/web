import { api } from "@/shared/lib/api/client";

import type { StandingRow } from "../types/standings.types";

export const STANDINGS_QUERY_KEY = ["standings"] as const;
export const STANDINGS_CACHE_TAG = "standings";

/**
 * Public endpoint — `serverApi`/`api` unwrap the `{ data, pagination }` envelope
 * and return the row array directly.
 */
export async function fetchStandings(): Promise<StandingRow[]> {
  const res = await api.get<StandingRow[]>("/api/standings");
  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? "Failed to load standings");
  }
  return res.data;
}
