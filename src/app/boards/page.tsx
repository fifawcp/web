import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Board } from "@/features/boards";
import { LAST_VISITED_BOARD_KEY } from "@/features/boards/constants/boards";
import { findGlobalBoard } from "@/features/boards/utils/boardStorage";
import { serverApi } from "@/shared/lib/api/server";

export default async function BoardsPage() {
  // Try cookie first to avoid unnecessary fetch
  const cookieStore = await cookies();
  const lastVisitedCookie = cookieStore.get(LAST_VISITED_BOARD_KEY);

  if (lastVisitedCookie?.value) {
    // Trust the cookie - if board doesn't exist, [boardId] page will handle error
    redirect(`/boards/${lastVisitedCookie.value}`);
  }

  // No cookie - fetch boards to find fallback
  const boardsRes = await serverApi.get<Board[]>(`/api/boards`);

  if (!boardsRes.success || !boardsRes.data || boardsRes.data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Failed to load boards</p>
      </div>
    );
  }

  const boards = boardsRes.data;
  const globalBoard = findGlobalBoard(boards);
  const fallbackBoardId = globalBoard?.id || boards[0]?.id;

  if (!fallbackBoardId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Error loading boards</p>
      </div>
    );
  }

  redirect(`/boards/${fallbackBoardId}`);
}
