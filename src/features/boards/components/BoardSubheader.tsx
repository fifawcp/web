"use client";

import { BoardSelector } from "@/features/boards/components/BoardSelector";
import { Board, BoardDetails, BoardMemberRole } from "@/features/boards/types/board.types";

import { ManageBoardDropdown } from "./ManageBoardDropdown";
import { ShareBoardDialog } from "./ShareBoardDialog";

interface BoardSubheaderProps {
  boards: Board[];
  currentBoard: BoardDetails;
  currentUserId: string;
  currentUserRole: BoardMemberRole;
}

export function BoardSubheader({ boards, currentBoard, currentUserId, currentUserRole }: BoardSubheaderProps) {
  const isOwner = currentBoard.viewer.is_owner;
  const isGlobalBoard = currentBoard.privacy === "public";

  return (
    <div className="flex items-center flex-col justify-between lg:flex-row gap-3 px-4 sm:px-6 lg:px-8 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <BoardSelector boards={boards} currentBoardId={currentBoard.id} currentBoardName={currentBoard.name} />
      {!isGlobalBoard && (
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <ManageBoardDropdown boardId={currentBoard.id} boardName={currentBoard.name} isOwner={isOwner} currentUserRole={currentUserRole} />
          <ShareBoardDialog board={currentBoard} currentUserId={currentUserId} />
        </div>
      )}
    </div>
  );
}
