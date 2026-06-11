import { api } from "@/shared/lib/api/client";
import { ApiClientError } from "@/shared/lib/api/errors";

import { normalizeCompetition } from "../lib/normalizeCompetition";
import type { BoardSummaryEntry, BoardSummaryPage, Competition, CreateCompetitionInput, LeaderboardEntry, LeaderboardPage } from "../types/competitions.types";

export const competitionsTag = (boardId: number) => `competitions:${boardId}` as const;
export const leaderboardTag = (boardId: number, competitionId: number) => `leaderboard:${boardId}:${competitionId}` as const;
// Board-wide tag carried by every leaderboard fetch so a membership change can bust all of a board's
// previews at once without knowing each competition id.
export const boardLeaderboardsTag = (boardId: number) => `leaderboards:${boardId}` as const;

export const competitionsKey = (boardId: number) => ["competitions", "list", boardId] as const;
export const boardSummaryKey = (boardId: number, params: { page: number; q: string; sort: string; dir: string }) => ["boards", "summary", boardId, params] as const;
export const leaderboardKey = (boardId: number, competitionId: number, params: { page: number; q: string; sort: string; dir: string }) =>
  ["competitions", "leaderboard", boardId, competitionId, params] as const;

export const LEADERBOARD_PAGE_SIZE = 10;

export async function fetchCompetitions(boardId: number): Promise<Competition[]> {
  const res = await api.get<Competition[]>(`/api/boards/${boardId}/competitions`, { authenticated: true });
  if (!res.success || !res.data) throw new Error(res.error?.message ?? "Failed to load competitions");
  return res.data.map(normalizeCompetition);
}

export async function fetchLeaderboard(
  boardId: number,
  competitionId: number,
  params: { page?: number; limit?: number; q?: string; sort?: string; dir?: string } = {}
): Promise<LeaderboardPage> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.q) search.set("q", params.q);
  if (params.sort && params.sort !== "total") search.set("sort", params.sort);
  if (params.dir && params.dir !== "desc") search.set("dir", params.dir);
  const qs = search.toString();
  const res = await api.get<LeaderboardEntry[]>(`/api/boards/${boardId}/competitions/${competitionId}/leaderboard${qs ? `?${qs}` : ""}`, { authenticated: true });
  if (!res.success || !res.data) throw new Error(res.error?.message ?? "Failed to load leaderboard");
  const fallback = { page: params.page ?? 1, limit: params.limit ?? res.data.length, total: res.data.length, has_more: false };
  const pagination = res.pagination ?? fallback;
  return { items: res.data, page: pagination.page, limit: pagination.limit, total: pagination.total, has_more: pagination.has_more };
}

export async function fetchBoardSummary(
  boardId: number,
  params: { page?: number; limit?: number; q?: string; sort?: string; dir?: string } = {}
): Promise<BoardSummaryPage> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.q) search.set("q", params.q);
  if (params.sort && params.sort !== "total") search.set("sort", params.sort);
  if (params.dir && params.dir !== "desc") search.set("dir", params.dir);
  const qs = search.toString();
  const res = await api.get<BoardSummaryEntry[]>(`/api/boards/${boardId}/summary${qs ? `?${qs}` : ""}`, { authenticated: true });
  if (!res.success || !res.data) throw new Error(res.error?.message ?? "Failed to load summary");
  const fallback = { page: params.page ?? 1, limit: params.limit ?? res.data.length, total: res.data.length, has_more: false };
  const pagination = res.pagination ?? fallback;
  return { items: res.data, page: pagination.page, limit: pagination.limit, total: pagination.total, has_more: pagination.has_more };
}

export async function createCompetition(boardId: number, input: CreateCompetitionInput): Promise<Competition> {
  const res = await api.post<Competition>(`/api/boards/${boardId}/competitions`, input, { authenticated: true });
  if (!res.success || !res.data) throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? "Failed to create competition");
  return res.data;
}

export async function deleteCompetition(boardId: number, competitionId: number): Promise<void> {
  const res = await api.delete<void>(`/api/boards/${boardId}/competitions/${competitionId}`, { authenticated: true });
  if (!res.success) throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? "Failed to delete competition");
}
