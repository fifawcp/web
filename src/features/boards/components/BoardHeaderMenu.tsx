"use client";

import { LogOut, MoreVertical, Settings2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";

import { canDeleteBoard, canLeaveBoard, canManageBoard } from "../lib/boardRole";
import type { Board } from "../types/boards.types";

type Props = {
  board: Board;
  onSettings: () => void;
  onLeave: () => void;
  onDelete: () => void;
};

// The header overflow menu. Items are gated by role: a plain member sees only "Leave"; admins get
// settings; owners additionally get delete.
export function BoardHeaderMenu({ board, onSettings, onLeave, onDelete }: Props) {
  const t = useTranslations("boards.header.menu");
  const showManage = canManageBoard(board.viewer.role);
  const showLeave = canLeaveBoard(board);
  const showDelete = canDeleteBoard(board.viewer.role);

  // Nothing actionable (e.g. the global board) — don't render an empty trigger.
  if (!showManage && !showLeave && !showDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={t("label")}>
          <MoreVertical className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {showManage ? (
          <DropdownMenuItem onSelect={onSettings} className="cursor-pointer whitespace-nowrap">
            <Settings2 className="size-4" aria-hidden />
            {t("settings")}
          </DropdownMenuItem>
        ) : null}
        {(showLeave || showDelete) && showManage ? <DropdownMenuSeparator /> : null}
        {showLeave ? (
          <DropdownMenuItem variant="destructive" onSelect={onLeave} className="cursor-pointer whitespace-nowrap">
            <LogOut className="size-4" aria-hidden />
            {t("leave")}
          </DropdownMenuItem>
        ) : null}
        {showDelete ? (
          <DropdownMenuItem variant="destructive" onSelect={onDelete} className="cursor-pointer whitespace-nowrap">
            <Trash2 className="size-4" aria-hidden />
            {t("delete")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
