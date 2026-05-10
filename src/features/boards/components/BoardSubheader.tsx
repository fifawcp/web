"use client";

import { useState } from "react";
import { LogOut, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { BoardSelector } from "@/features/boards/components/BoardSelector";
import { useBoardPermissions } from "@/features/boards/hooks/useBoardPermissions";
import { Board, BoardDetails } from "@/features/boards/types/board.types";
import { Button } from "@/shared/components/ui/button";

import { BoardActionsMenu } from "./BoardActionsMenu";
import { DeleteLeaveBoardDialog } from "./DeleteLeaveBoardDialog";
import { ShareBoardDialog } from "./ShareBoardDialog";
import { UpdateBoardDialog } from "./UpdateBoardDialog";

interface BoardSubheaderProps {
  boards: Board[];
  currentBoard: BoardDetails;
  currentUserId: string;
}

export function BoardSubheader({ boards, currentBoard, currentUserId }: BoardSubheaderProps) {
  const t = useTranslations("boards");
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const openShareDialog = () => setShareDialogOpen(true);
  const openUpdateDialog = () => setUpdateDialogOpen(true);
  const openLeaveDialog = () => setLeaveDialogOpen(true);

  const { isOwner, isAdmin, canManage, isGlobalBoard } = useBoardPermissions(currentBoard, currentUserId);

  return (
    <div className="flex items-center flex-row justify-between  gap-3 px-4 sm:px-6 lg:px-8 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <BoardSelector boards={boards} currentBoardId={currentBoard.id} currentBoardName={currentBoard.name} />

      {!isGlobalBoard && (
        <>
          {/* Mobile */}
          <div className="md:hidden">
            <BoardActionsMenu isOwner={isOwner} isAdmin={isAdmin} onShareClick={openShareDialog} onUpdateClick={openUpdateDialog} onDeleteLeaveClick={openLeaveDialog} />
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3 w-full lg:w-auto">
            {canManage && (
              <BoardActionsMenu
                isOwner={isOwner}
                isAdmin={isAdmin}
                onShareClick={openShareDialog}
                onUpdateClick={openUpdateDialog}
                onDeleteLeaveClick={openLeaveDialog}
              />
            )}

            {!canManage && (
              <Button size="sm" variant="outline" className="bg-background text-destructive hover:text-destructive h-auto py-2 px-3 text-sm" onClick={openLeaveDialog}>
                <LogOut className="h-3.5 w-3.5" />
                {t("leave.trigger")}
              </Button>
            )}

            <Button size="sm" className="h-auto py-2 px-3 text-sm" onClick={openShareDialog}>
              <UserPlus className="h-4 w-4" />
              {t("subheader.inviteFriends")}
            </Button>
          </div>
        </>
      )}

      {/* Dialogs - Shared between mobile and desktop */}
      <ShareBoardDialog board={currentBoard} currentUserId={currentUserId} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
      {isAdmin && <UpdateBoardDialog boardId={currentBoard.id} boardName={currentBoard.name} open={updateDialogOpen} onOpenChange={setUpdateDialogOpen} />}
      <DeleteLeaveBoardDialog boardId={currentBoard.id} boardName={currentBoard.name} isOwner={isOwner} open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen} />
    </div>
  );
}
