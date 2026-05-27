"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { BOARDS_LIST_KEY, createBoard, deleteBoard, joinBoard, leaveBoard, regenerateJoinCode, updateBoard } from "../api/boards";
import type { Board, BoardListItem, CreateBoardInput, JoinBoardInput, UpdateBoardInput } from "../types/boards.types";

type OptimisticContext = { previous: BoardListItem[] | undefined };

function optimisticListPatch(qc: ReturnType<typeof useQueryClient>, id: number, patch: Partial<BoardListItem>) {
  return async (): Promise<OptimisticContext> => {
    await qc.cancelQueries({ queryKey: BOARDS_LIST_KEY });
    const previous = qc.getQueryData<BoardListItem[]>(BOARDS_LIST_KEY);
    if (previous) {
      qc.setQueryData<BoardListItem[]>(
        BOARDS_LIST_KEY,
        previous.map((b) => (b.id === id ? { ...b, ...patch } : b))
      );
    }
    return { previous };
  };
}

function rollback(qc: ReturnType<typeof useQueryClient>) {
  return (_err: unknown, _input: unknown, context: OptimisticContext | undefined) => {
    if (context?.previous) qc.setQueryData(BOARDS_LIST_KEY, context.previous);
  };
}

export function useCreateBoard() {
  return useMutation<Board, Error, CreateBoardInput>({ mutationFn: createBoard });
}

export function useJoinBoard() {
  return useMutation<{ board_id: number }, Error, JoinBoardInput>({ mutationFn: joinBoard });
}

export function useRenameBoard(id: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, { name: string }, OptimisticContext>({
    mutationFn: ({ name }) => updateBoard(id, { name }),
    onMutate: ({ name }) => optimisticListPatch(qc, id, { name })(),
    onError: rollback(qc),
  });
}

export function useUpdateBoard(id: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, UpdateBoardInput, OptimisticContext>({
    mutationFn: (input) => updateBoard(id, input),
    onMutate: (input) => optimisticListPatch(qc, id, input)(),
    onError: rollback(qc),
  });
}

export function useRegenerateJoinCode(id: number) {
  return useMutation<{ join_code: string }, Error>({ mutationFn: () => regenerateJoinCode(id) });
}

export function useLeaveBoard(id: number) {
  return useMutation<void, Error>({ mutationFn: () => leaveBoard(id) });
}

export function useDeleteBoard(id: number) {
  return useMutation<void, Error>({ mutationFn: () => deleteBoard(id) });
}
