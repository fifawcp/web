"use client";

import { useState } from "react";
import { LogOut, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { BoardSelector } from "@/features/boards/components/BoardSelector";
import { Board, BoardDetails, BoardMemberRole } from "@/features/boards/types/board.types";
import { Button } from "@/shared/components/ui/button";
import { useIsMobile } from "@/shared/hooks/useIsMobile";

import { BoardActionsMobile } from "./BoardActionsMobile";
import { DeleteLeaveBoardDialog } from "./DeleteLeaveBoardDialog";
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
  const isMobile = useIsMobile();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const isOwner = currentBoard.viewer.is_owner;
  const isGlobalBoard = currentBoard.privacy === "public";
  const isAdmin = currentUserRole === "admin";
  const canManage = isOwner || isAdmin;

  return (
    <div className="flex items-center flex-row justify-between  gap-3 px-4 sm:px-6 lg:px-8 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <BoardSelector boards={boards} currentBoardId={currentBoard.id} currentBoardName={currentBoard.name} />

      {!isGlobalBoard && (
        <>
          {/* Mobile: Single dropdown with all actions */}
          {isMobile ? (
            <BoardActionsMobile board={currentBoard} currentUserId={currentUserId} currentUserRole={currentUserRole} />
          ) : (
            /* Desktop: Separate buttons */
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Admin/Owner: Manage + Share */}
              {canManage && (
                <>
                  <ManageBoardDropdown boardId={currentBoard.id} boardName={currentBoard.name} isOwner={isOwner} currentUserRole={currentUserRole} />
                  <Button size="sm" className="h-auto py-2 px-3 text-sm w-auto flex-1 lg:w-auto" onClick={() => setShareDialogOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                    {t("subheader.inviteFriends")}
                  </Button>
                </>
              )}

              {/* Member: Leave + Share */}
              {!isOwner && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-background text-destructive hover:text-destructive h-auto py-2 px-3 text-sm w-auto flex-1 lg:w-auto"
                    onClick={() => setLeaveDialogOpen(true)}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("leave.trigger")}
                  </Button>
                  <Button size="sm" className="h-auto py-2 px-3 text-sm w-auto flex-1 lg:w-auto" onClick={() => setShareDialogOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                    {t("subheader.inviteFriends")}
                  </Button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Dialogs (Desktop only) */}
      {!isMobile && (
        <>
          <ShareBoardDialog board={currentBoard} currentUserId={currentUserId} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
          {!isOwner && (
            <DeleteLeaveBoardDialog boardId={currentBoard.id} boardName={currentBoard.name} isOwner={false} open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen} />
          )}
        </>
      )}
    </div>
  );
}
