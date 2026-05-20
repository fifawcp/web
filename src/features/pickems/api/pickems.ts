import { api } from "@/shared/lib/api/client";

import type { SaveBestThirdsPayload, SaveBracketPicksPayload, SaveGroupPicksPayload, UserPickem } from "../types/pickems.types";

export const PICKEMS_QUERY_KEY = ["pickems"] as const;
export const PICKEMS_CACHE_TAG = "pickems";

export async function fetchPickems(): Promise<UserPickem> {
  const res = await api.get<UserPickem>("/api/pickems", { authenticated: true });
  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? "Failed to load pickems");
  }

  return res.data;
}

async function putPickem<T>(endpoint: string, body: T): Promise<UserPickem> {
  const res = await api.put<UserPickem>(endpoint, body, { authenticated: true });
  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? "Failed to save");
  }

  return res.data;
}

export const saveGroupPicks = (body: SaveGroupPicksPayload) => putPickem("/api/pickems/groups", body);
export const saveBestThirds = (body: SaveBestThirdsPayload) => putPickem("/api/pickems/best-thirds", body);
export const saveBracketPicks = (body: SaveBracketPicksPayload) => putPickem("/api/pickems/bracket", body);
