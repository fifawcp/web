"use client";

import { useTranslations } from "next-intl";

import { BoardSelector } from "@/features/boards/components/BoardSelector";
import { Board, BoardDetails, BoardMemberRole } from "@/features/boards/types/board.types";

import { CreateBoardDialog } from "./CreateBoardDialog";
import { JoinBoardDialog } from "./JoinBoardDialog";
import { ManageBoardDropdown } from "./ManageBoardDropdown";
import { ShareBoardDialog } from "./ShareBoardDialog";

interface BoardSubheaderProps {
  boards: Board[];
  currentBoard: BoardDetails;
  currentUserId: string;
  currentUserRole: BoardMemberRole;
}

export function BoardSubheader({ boards, currentBoard, currentUserId, currentUserRole }: BoardSubheaderProps) {
  const t = useTranslations("boards");
  const isOwner = currentBoard.viewer.is_owner;
  const isGlobalBoard = currentBoard.privacy === "public";

  return (
    <>
      <div className="flex items-start lg:items-center flex-col justify-between lg:flex-row gap-3 px-4 sm:px-6 lg:px-8 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between flex-row gap-3">
          <div className="w-auto sm:min-w-60 shrink-0 flex items-center justify-between gap-1 p-1.5 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <span className="text-xs sm:text-sm text-muted-foreground p-1 sm:hidden">{t("selector.board")}:</span>
            <span className="text-xs sm:text-sm text-muted-foreground p-1 hidden sm:inline">{t("selector.nowSeeing")}:</span>
            <div className="border-l border-zinc-300 dark:border-zinc-700 h-6" />
            <BoardSelector boards={boards} currentBoardId={currentBoard.id} currentBoardName={currentBoard.name} />
          </div>
          <div className="flex items-center gap-3 ">
            <CreateBoardDialog />
            <JoinBoardDialog />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {!isGlobalBoard && <ManageBoardDropdown boardId={currentBoard.id} boardName={currentBoard.name} isOwner={isOwner} currentUserRole={currentUserRole} />}
          {!isGlobalBoard && <ShareBoardDialog board={currentBoard} currentUserId={currentUserId} />}
        </div>
      </div>
    </>
  );
}
