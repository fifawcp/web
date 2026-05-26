import type { Board, BoardRole } from "../types/boards.types";

export const isGlobalBoard = (board: Board) => board.privacy === "global";

export const canManageBoard = (role: BoardRole) => role === "owner" || role === "admin";

export const canDeleteBoard = (role: BoardRole) => role === "owner";

export const canLeaveBoard = (board: Board) => !isGlobalBoard(board);

export const canCreateCompetitions = (board: Board) => canManageBoard(board.viewer.role) && !isGlobalBoard(board);
