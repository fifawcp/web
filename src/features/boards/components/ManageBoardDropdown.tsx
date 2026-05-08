"use client";

import { useState } from "react";
import { Settings, Trash2, Edit } from "lucide-react";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isAdmin = currentUserRole === "admin";
  const canManage = isOwner || isAdmin;

  if (!canManage) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="bg-background text-foreground h-auto py-2 px-3 text-sm w-auto flex-1 lg:w-auto">
            <Settings className="h-3.5 w-3.5" />
            {t("manage.trigger")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-(--radix-dropdown-menu-trigger-width)">
          {isAdmin && (
            <DropdownMenuItem className="gap-2" onClick={() => setUpdateDialogOpen(true)}>
              <Edit className="h-4 w-4" />
              {t("update.trigger")}
            </DropdownMenuItem>
          )}
          {isOwner && (
            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {t("delete.trigger")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isAdmin && <UpdateBoardDialog boardId={boardId} boardName={boardName} open={updateDialogOpen} onOpenChange={setUpdateDialogOpen} />}

      {isOwner && <DeleteLeaveBoardDialog boardId={boardId} boardName={boardName} isOwner={true} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />}
    </>
  );
}
