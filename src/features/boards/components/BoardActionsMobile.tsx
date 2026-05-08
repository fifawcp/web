"use client";

import { useState } from "react";
import { Edit, LogOut, MoreVertical, Share2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { BoardDetails, BoardMemberRole } from "@/features/boards/types/board.types";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";

import { DeleteLeaveBoardDialog } from "./DeleteLeaveBoardDialog";
import { ShareBoardDialog } from "./ShareBoardDialog";
import { UpdateBoardDialog } from "./UpdateBoardDialog";

interface BoardActionsMobileProps {
  board: BoardDetails;
  currentUserId: string;
  currentUserRole: BoardMemberRole;
}

export function BoardActionsMobile({ board, currentUserId, currentUserRole }: BoardActionsMobileProps) {
  const t = useTranslations("boards");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteLeaveDialogOpen, setDeleteLeaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isOwner = board.viewer.is_owner;
  const isAdmin = currentUserRole === "admin";
  const canManage = isOwner || isAdmin;

  const handleShareClick = () => {
    setDropdownOpen(false);
    setShareDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="bg-background text-foreground h-auto py-2.5 px-3">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Share - Available to all members */}
          <DropdownMenuItem className="gap-2" onClick={handleShareClick}>
            <Share2 className="h-4 w-4" />
            {t("subheader.inviteFriends")}
          </DropdownMenuItem>

          {canManage && <DropdownMenuSeparator />}

          {/* Update - Admin only */}
          {isAdmin && (
            <DropdownMenuItem className="gap-2" onClick={() => setUpdateDialogOpen(true)}>
              <Edit className="h-4 w-4" />
              {t("update.trigger")}
            </DropdownMenuItem>
          )}

          {/* Delete - Owner only */}
          {isOwner && (
            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteLeaveDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {t("delete.trigger")}
            </DropdownMenuItem>
          )}

          {/* Leave - Non-owner members */}
          {!isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteLeaveDialogOpen(true)}>
                <LogOut className="h-4 w-4" />
                {t("leave.trigger")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <ShareBoardDialog board={board} currentUserId={currentUserId} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />

      {isAdmin && <UpdateBoardDialog boardId={board.id} boardName={board.name} open={updateDialogOpen} onOpenChange={setUpdateDialogOpen} />}

      <DeleteLeaveBoardDialog boardId={board.id} boardName={board.name} isOwner={isOwner} open={deleteLeaveDialogOpen} onOpenChange={setDeleteLeaveDialogOpen} />
    </>
  );
}
