"use client";

import { useTranslations } from "next-intl";

import { BoardSelector } from "@/features/boards/components/BoardSelector";
import { Board, BoardDetails } from "@/features/boards/types/board.types";

import { CreateBoardDialog } from "./CreateBoardDialog";
import { JoinBoardDialog } from "./JoinBoardDialog";
import { ManageBoardDropdown } from "./ManageBoardDropdown";

interface BoardSubheaderProps {
  boards: Board[];
  currentBoard: BoardDetails;
}

export function BoardSubheader({ boards, currentBoard }: BoardSubheaderProps) {
  const t = useTranslations("boards");
  const isOwner = currentBoard.viewer.is_owner;
  const isGlobalBoard = currentBoard.privacy === "public";

  return (
    <>
      <div className="flex items-start md:items-center flex-col justify-between md:flex-row gap-3 px-4 sm:px-6 lg:px-8 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start md:items-center flex-col justify-between md:flex-row gap-3">
          <div className="min-w-60 shrink-0 flex items-center justify-between gap-1 p-1.5 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <span className="text-sm text-muted-foreground p-1">{t("selector.nowSeeing")}:</span>
            <div className="border-l border-zinc-300 dark:border-zinc-700 h-6" />
            <BoardSelector boards={boards} currentBoardId={String(currentBoard.id)} currentBoardName={currentBoard.name} />
          </div>
          <div className="flex items-center gap-3">
            <CreateBoardDialog />
            <JoinBoardDialog />
          </div>
        </div>
        {!isGlobalBoard && <ManageBoardDropdown boardId={String(currentBoard.id)} boardName={currentBoard.name} isOwner={isOwner} />}
      </div>
    </>
  );
}
