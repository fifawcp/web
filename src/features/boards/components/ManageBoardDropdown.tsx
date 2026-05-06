"use client";

import { useState } from "react";
import { Settings, Trash2, LogOut, Edit } from "lucide-react";
import { useTranslations } from "next-intl";

import { DeleteLeaveBoardDialog } from "@/features/boards/components/DeleteLeaveBoardDialog";
import { UpdateBoardDialog } from "@/features/boards/components/UpdateBoardDialog";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";

import { BoardMemberRole } from "../types/board.types";

interface ManageBoardDropdownProps {
  boardId: string;
  boardName: string;
  isOwner: boolean;
  currentUserRole: BoardMemberRole;
}

export function ManageBoardDropdown({ boardId, boardName, isOwner, currentUserRole }: ManageBoardDropdownProps) {
  const t = useTranslations("boards");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteLeaveDialogOpen, setDeleteLeaveDialogOpen] = useState(false);

  const isAdmin = currentUserRole === "admin";
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="bg-background text-foreground h-auto py-2 px-3 text-sm w-1/2 lg:w-auto">
            <Settings className="h-3.5 w-3.5" />
            {t("manage.trigger")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAdmin && (
            <DropdownMenuItem className="gap-2" onClick={() => setUpdateDialogOpen(true)}>
              <Edit className="h-4 w-4" />
              {t("update.trigger")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteLeaveDialogOpen(true)}>
            {isOwner ? <Trash2 className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
            {isOwner ? t("delete.trigger") : t("leave.trigger")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateBoardDialog boardId={boardId} boardName={boardName} open={updateDialogOpen} onOpenChange={setUpdateDialogOpen} />

      <DeleteLeaveBoardDialog boardId={boardId} boardName={boardName} isOwner={isOwner} open={deleteLeaveDialogOpen} onOpenChange={setDeleteLeaveDialogOpen} />
    </>
  );
}
