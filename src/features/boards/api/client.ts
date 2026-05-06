import { api } from "@/shared/lib/api/client";
import { ApiResponse } from "@/shared/lib/api/types";

import { Board, BoardDetails, BoardMembersList, CreateBoardRequest, JoinBoardRequest, UpdateBoardRequest, UpdateMemberRoleRequest } from "../types/board.types";

export const getBoards = async (): Promise<ApiResponse<Board[]>> => {
  return api.get<Board[]>("/api/boards", { authenticated: true });
};

export const createBoard = async (data: CreateBoardRequest): Promise<ApiResponse<Board>> => {
  return api.post<Board>("/api/boards", data, { authenticated: true });
};

export const joinBoard = async (data: JoinBoardRequest): Promise<ApiResponse<{ board_id: string }>> => {
  return api.post<{ board_id: string }>("/api/boards/join", data, { authenticated: true });
};

export const getBoardDetails = async (boardId: string): Promise<ApiResponse<BoardDetails>> => {
  return api.get<BoardDetails>(`/api/boards/${boardId}`, { authenticated: true });
};

export const deleteBoard = async (boardId: string): Promise<ApiResponse<void>> => {
  return api.delete<void>(`/api/boards/${boardId}`, { authenticated: true });
};

export const leaveBoard = async (boardId: string): Promise<ApiResponse<void>> => {
  return api.delete<void>(`/api/boards/${boardId}/leave`, { authenticated: true });
};

export const updateBoard = async (boardId: string, data: UpdateBoardRequest): Promise<ApiResponse<Board>> => {
  return api.patch<Board>(`/api/boards/${boardId}`, data, { authenticated: true });
};

export const removeBoardMember = async (boardId: string, userId: string): Promise<ApiResponse<void>> => {
  return api.delete<void>(`/api/boards/${boardId}/members/${userId}`, { authenticated: true });
};

export const updateMemberRole = async (boardId: string, userId: string, data: UpdateMemberRoleRequest): Promise<ApiResponse<void>> => {
  return api.patch<void>(`/api/boards/${boardId}/members/${userId}/role`, data, { authenticated: true });
};

export const regenerateJoinCode = async (boardId: string): Promise<ApiResponse<{ join_code: string }>> => {
  return api.post<{ join_code: string }>(`/api/boards/${boardId}/regenerate-join-code`, undefined, { authenticated: true });
};

export const getBoardMembers = async (boardId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<BoardMembersList>> => {
  return api.get<BoardMembersList>(`/api/boards/${boardId}/members?page=${page}&limit=${limit}`, { authenticated: true });
};
