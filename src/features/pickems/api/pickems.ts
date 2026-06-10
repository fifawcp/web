import { api } from "@/shared/lib/api/client";
import { ApiClientError } from "@/shared/lib/api/errors";

import { syncDraftBaseline } from "../lib/draftBaseline";
import type { SaveBestThirdsPayload, SaveBracketPicksPayload, SaveGroupPicksPayload, UserPickem } from "../types/pickems.types";

export const PICKEMS_QUERY_KEY = ["pickems"] as const;
export const PICKEMS_CACHE_TAG = "pickems";

export async function fetchPickems(): Promise<UserPickem> {
  const res = await api.get<UserPickem>("/api/pickems", { authenticated: true });
  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? "Failed to load pickems");
  }

  // Every fetch result is server truth — keep the draft-staleness baseline current.
  syncDraftBaseline(res.data);
  return res.data;
}

async function putPickem<T>(endpoint: string, body: T): Promise<UserPickem> {
  const res = await api.put<UserPickem>(endpoint, body, { authenticated: true });
  if (!res.success || !res.data) {
    // Preserve the backend's code + per-field detail so callers can log exactly
    // what was rejected (e.g. bracket VALIDATION_FAILED → fields.bracket_picks).
    throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? "Failed to save", res.error?.fields);
  }

  return res.data;
}

export const saveGroupPicks = (body: SaveGroupPicksPayload) => putPickem("/api/pickems/groups", body);
export const saveBestThirds = (body: SaveBestThirdsPayload) => putPickem("/api/pickems/best-thirds", body);
export const saveBracketPicks = (body: SaveBracketPicksPayload) => putPickem("/api/pickems/bracket", body);
