import { redirect } from "next/navigation";

import { Board, BoardDetails, BoardMemberDetails } from "@/features/boards";
import { BoardDetailsView } from "@/features/boards/components/BoardDetailsView";
import { auth } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

interface BoardDetailsPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardDetailsPage({ params }: BoardDetailsPageProps) {
  const { boardId } = await params;

  const { user } = await auth({ required: true });

  const [boardRes, boardsRes, membersRes] = await Promise.all([
    serverApi.get<BoardDetails>(`/api/boards/${boardId}`),
    serverApi.get<Board[]>(`/api/boards`),
    serverApi.get<BoardMemberDetails[]>(`/api/boards/${boardId}/members`),
  ]);

  if (!boardRes.success || !boardRes.data || !boardsRes.success || !boardsRes.data || !membersRes.success || !membersRes.data || !membersRes.pagination) {
    const errorCode = boardRes.error?.code || membersRes.error?.code || "DEFAULT";
    const globalBoard = boardsRes.data?.find((b) => b.privacy === "public");

    // Redirect to global board with error code for toast notification
    if (globalBoard) {
      redirect(`/boards/${globalBoard.id}?error=${errorCode}`);
    }

    // Fallback if no global board exists
    redirect("/boards?error=DEFAULT");
  }

  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] animate-appear bg-zinc-50 dark:bg-zinc-900">
      <BoardDetailsView
        board={boardRes.data}
        boards={boardsRes.data}
        initialMembers={membersRes.data}
        initialPagination={membersRes.pagination}
        currentUserId={user.id}
        boardId={boardId}
      />
    </div>
  );
}
