import { Board } from "@/features/boards";
import { BoardRedirect } from "@/features/boards/components/BoardRedirect";
import { findGlobalBoard } from "@/features/boards/utils/boardStorage";
import { serverApi } from "@/shared/lib/api/server";

export default async function BoardsPage() {
  const boardsRes = await serverApi.get<Board[]>(`/api/boards`);

  if (!boardsRes.success || !boardsRes.data || boardsRes.data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Failed to load boards</p>
      </div>
    );
  }

  const globalBoard = findGlobalBoard(boardsRes.data);
  const fallbackBoardId = globalBoard?.id || boardsRes.data[0]?.id;

  if (!fallbackBoardId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Error loading boards</p>
      </div>
    );
  }

  return <BoardRedirect boards={boardsRes.data} fallbackBoardId={fallbackBoardId} />;
}
