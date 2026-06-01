import { api } from "@/shared/lib/api/client";
import { ApiClientError } from "@/shared/lib/api/errors";

import type { Player, PlayerQuery, PlayerSearchResult, PopularPicksByAward, SaveAwardPicksPayload, UserAwards } from "../types/awards.types";

export const AWARDS_QUERY_KEY = ["awards"] as const;
export const AWARDS_CACHE_TAG = "awards";

/** Base key for player searches; the active filters are appended per-query. */
export const PLAYERS_QUERY_KEY = ["players"] as const;

/** Base key for the shared popular-picks fetch. */
export const POPULAR_QUERY_KEY = ["awards", "popular"] as const;

/** Backend max page size — we request the whole first page to avoid paging UI. */
export const PLAYERS_PAGE_LIMIT = 100;

/** Default top-N per award for the popular-picks list. */
export const POPULAR_PICKS_LIMIT = 10;

export async function fetchAwards(): Promise<UserAwards> {
  const res = await api.get<UserAwards>("/api/awards", { authenticated: true });
  if (!res.success || !res.data) {
    throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? "Failed to load awards");
  }
  return res.data;
}

/**
 * Replace the user's award picks with the given set (0..4, each award_type at
 * most once). Throws `ApiClientError` on failure so callers can run it through
 * `translateApiError` for a locale-aware toast — the backend rejects locked /
 * ineligible picks with a coded 400 (e.g. a non-GK for the Golden Glove).
 */
export async function saveAwardPicks(payload: SaveAwardPicksPayload): Promise<UserAwards> {
  const res = await api.put<UserAwards>("/api/awards", payload, { authenticated: true });
  if (!res.success || !res.data) {
    throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? "Failed to save awards");
  }
  return res.data;
}

/** Serialize a `PlayerQuery` to the backend's query string (csv array params). */
export function buildPlayersSearch(query: PlayerQuery): string {
  const params = new URLSearchParams();
  const q = query.q?.trim();
  if (q) params.set("q", q);
  if (query.positions?.length) params.set("positions", query.positions.join(","));
  if (query.team_fifa_codes?.length) params.set("team_fifa_codes", query.team_fifa_codes.join(","));
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? PLAYERS_PAGE_LIMIT));
  return params.toString();
}

/**
 * Search the tournament player catalog. Surfaces the data array plus the
 * paginator's `has_more` (the picker hints "refine your search" rather than
 * paging through 1600 rows). The `signal` lets React Query abort a search the
 * moment a newer keystroke supersedes it.
 */
export async function fetchPlayers(query: PlayerQuery, signal?: AbortSignal): Promise<PlayerSearchResult> {
  const res = await api.get<Player[]>(`/api/players?${buildPlayersSearch(query)}`, { authenticated: true, signal });
  if (!res.success || !res.data) {
    throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? "Failed to load players");
  }
  return { players: res.data, hasMore: res.pagination?.has_more ?? false };
}

/**
 * Fetch the most-picked players per award in one call. Eligibility is enforced
 * server-side, so each award's list is ready to render as-is.
 */
export async function fetchPopularPicks(limit = POPULAR_PICKS_LIMIT, signal?: AbortSignal): Promise<PopularPicksByAward> {
  const res = await api.get<PopularPicksByAward>(`/api/awards/popular?limit=${limit}`, { authenticated: true, signal });
  if (!res.success || !res.data) {
    throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? "Failed to load popular picks");
  }
  return res.data;
}
