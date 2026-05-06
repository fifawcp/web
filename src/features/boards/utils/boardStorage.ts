import { LAST_VISITED_BOARD_KEY } from "@/features/boards/constants/boards";
import { Board } from "@/features/boards/types/board.types";

export function findGlobalBoard(boards: Board[]): Board | undefined {
  return boards.find((board) => board.privacy === "public");
}

export function getLastVisitedBoardId(boards: Board[]): string {
  if (typeof window === "undefined") {
    const globalBoard = findGlobalBoard(boards);
    return globalBoard?.id || boards[0]?.id || "";
  }

  const lastVisited = localStorage.getItem(LAST_VISITED_BOARD_KEY);
  if (lastVisited) return lastVisited;

  const globalBoard = findGlobalBoard(boards);
  return globalBoard?.id || boards[0]?.id || "";
}

export function setLastVisitedBoardId(boardId: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(LAST_VISITED_BOARD_KEY, boardId);
}

export function removeLastVisitedBoardId(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(LAST_VISITED_BOARD_KEY);
}
