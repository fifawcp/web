import { api } from "@/shared/lib/api/client";
import { ApiClientError } from "@/shared/lib/api/errors";
import type { ApiResponse } from "@/shared/lib/api/types";

import type { Board, BoardListItem, BoardMember, BoardMembersPage, BoardRole, CreateBoardInput, JoinBoardInput, UpdateBoardInput } from "../types/boards.types";

export const BOARDS_LIST_TAG = "boards:list";
export const boardTag = (id: number) => `boards:${id}` as const;
export const boardMembersTag = (id: number) => `boards:${id}:members` as const;

export const BOARDS_LIST_KEY = ["boards", "list"] as const;
export const boardKey = (id: number) => ["boards", "detail", id] as const;
export const boardMembersKey = (id: number, params?: { page?: number; search?: string; limit?: number }) => ["boards", "members", id, params ?? {}] as const;

export const BOARD_MEMBERS_PAGE_SIZE = 10;

function unwrap<T>(res: ApiResponse<T>, fallback: string): T {
  if (res.success && res.data !== undefined) return res.data;
  throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? fallback);
}

function ensureSuccess<T>(res: ApiResponse<T>, fallback: string): void {
  if (res.success) return;
  throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? fallback);
}

export async function fetchBoards(): Promise<BoardListItem[]> {
  return unwrap(await api.get<BoardListItem[]>("/api/boards", { authenticated: true }), "Failed to load boards");
}

// Best-effort cache bust so a follow-up router.refresh() re-renders with fresh board state.
export async function revalidateBoard(id: number): Promise<void> {
  await api.post(`/api/boards/${id}/revalidate`).catch(() => undefined);
}

export async function fetchBoard(id: number): Promise<Board> {
  return unwrap(await api.get<Board>(`/api/boards/${id}`, { authenticated: true }), "Failed to load board");
}

export async function fetchBoardMembers(id: number, params: { page?: number; search?: string; limit?: number } = {}): Promise<BoardMembersPage> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  const query = qs.toString();
  const res = await api.get<BoardMember[]>(`/api/boards/${id}/members${query ? `?${query}` : ""}`, { authenticated: true });
  const items = unwrap(res, "Failed to load members");
  const fallback = { page: params.page ?? 1, limit: items.length, total: items.length, has_more: false };
  const pagination = res.pagination ?? fallback;
  return { items, page: pagination.page, limit: pagination.limit, total: pagination.total, has_more: pagination.has_more };
}

export async function createBoard(input: CreateBoardInput): Promise<Board> {
  return unwrap(await api.post<Board>("/api/boards", input, { authenticated: true }), "Failed to create board");
}

export async function joinBoard(input: JoinBoardInput): Promise<{ board_id: number; alreadyMember: boolean }> {
  const res = await api.post<{ board_id: number }>("/api/boards/join", input, { authenticated: true });
  const data = unwrap(res, "Failed to join board");
  return { ...data, alreadyMember: res.status === 200 };
}

export async function updateBoard(id: number, input: UpdateBoardInput): Promise<void> {
  // The backend acknowledges with 204 (no body), so treat success as void —
  // the optimistic cache patch + router.refresh() reconcile the new state.
  ensureSuccess(await api.patch<void>(`/api/boards/${id}`, input, { authenticated: true }), "Failed to update board");
}

export async function deleteBoard(id: number): Promise<void> {
  ensureSuccess(await api.delete<void>(`/api/boards/${id}`, { authenticated: true }), "Failed to delete board");
}

export async function leaveBoard(id: number): Promise<void> {
  ensureSuccess(await api.delete<void>(`/api/boards/${id}/leave`, { authenticated: true }), "Failed to leave board");
}

export async function regenerateJoinCode(id: number): Promise<{ join_code: string }> {
  return unwrap(await api.post<{ join_code: string }>(`/api/boards/${id}/regenerate-join-code`, undefined, { authenticated: true }), "Failed to regenerate join code");
}

export async function updateMemberRole(boardId: number, userId: string, role: Exclude<BoardRole, "owner">): Promise<void> {
  ensureSuccess(await api.patch<void>(`/api/boards/${boardId}/members/${userId}/role`, { role }, { authenticated: true }), "Failed to update role");
}

export async function removeMember(boardId: number, userId: string): Promise<void> {
  ensureSuccess(await api.delete<void>(`/api/boards/${boardId}/members/${userId}`, { authenticated: true }), "Failed to remove member");
}

export async function transferOwnership(boardId: number, userId: string): Promise<void> {
  ensureSuccess(await api.post<void>(`/api/boards/${boardId}/members/${userId}/transfer-ownership`, undefined, { authenticated: true }), "Failed to transfer ownership");
}
