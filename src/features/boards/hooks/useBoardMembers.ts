"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { boardMembersKey, fetchBoardMembers, removeMember, transferOwnership, updateMemberRole } from "../api/boards";
import type { BoardMember, BoardMembersPage, BoardRole } from "../types/boards.types";

export function useBoardMembers(boardId: number, params: { page?: number; search?: string; limit?: number } = {}, enabled = true) {
  return useQuery({
    queryKey: boardMembersKey(boardId, params),
    queryFn: () => fetchBoardMembers(boardId, params),
    enabled: enabled && Number.isFinite(boardId),
  });
}

type MembersContext = { previous: BoardMembersPage | undefined };

function patchMembers(
  qc: ReturnType<typeof useQueryClient>,
  boardId: number,
  params: { page?: number; search?: string; limit?: number },
  transform: (member: BoardMember) => BoardMember | null
) {
  return async (): Promise<MembersContext> => {
    const key = boardMembersKey(boardId, params);
    await qc.cancelQueries({ queryKey: key });
    const previous = qc.getQueryData<BoardMembersPage>(key);
    if (previous) {
      qc.setQueryData<BoardMembersPage>(key, {
        ...previous,
        items: previous.items.map((m) => transform(m)).filter((m): m is BoardMember => m !== null),
      });
    }
    return { previous };
  };
}

function rollbackMembers(qc: ReturnType<typeof useQueryClient>, boardId: number, params: { page?: number; search?: string; limit?: number }) {
  return (_err: unknown, _input: unknown, context: MembersContext | undefined) => {
    if (context?.previous) qc.setQueryData(boardMembersKey(boardId, params), context.previous);
  };
}

export function useUpdateMemberRole(boardId: number, params: { page?: number; search?: string; limit?: number } = {}) {
  const qc = useQueryClient();
  return useMutation<void, Error, { userId: string; role: Exclude<BoardRole, "owner"> }, MembersContext>({
    mutationFn: ({ userId, role }) => updateMemberRole(boardId, userId, role),
    onMutate: ({ userId, role }) => patchMembers(qc, boardId, params, (m) => (m.user_id === userId ? { ...m, role } : m))(),
    onError: rollbackMembers(qc, boardId, params),
  });
}

export function useRemoveMember(boardId: number, params: { page?: number; search?: string; limit?: number } = {}) {
  const qc = useQueryClient();
  return useMutation<void, Error, { userId: string }, MembersContext>({
    mutationFn: ({ userId }) => removeMember(boardId, userId),
    onMutate: ({ userId }) => patchMembers(qc, boardId, params, (m) => (m.user_id === userId ? null : m))(),
    onError: rollbackMembers(qc, boardId, params),
  });
}

export function useTransferOwnership(boardId: number) {
  return useMutation<void, Error, { userId: string }>({
    mutationFn: ({ userId }) => transferOwnership(boardId, userId),
  });
}
