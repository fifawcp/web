"use client";

import { useState } from "react";
import { ChevronDown, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

import { useBoardDialogParam } from "../hooks/useBoardDialogParam";
import { canManageBoard } from "../lib/boardRole";
import type { Board, BoardListItem } from "../types/boards.types";

import { BoardHeaderAvatars } from "./BoardHeaderAvatars";
import { BoardHeaderMenu } from "./BoardHeaderMenu";
import { BoardSquare } from "./BoardSquare";
import { BoardSwitcher } from "./BoardSwitcher";
import { CreateBoardDialog } from "./CreateBoardDialog";
import { DeleteBoardDialog } from "./DeleteBoardDialog";
import { InviteDialog } from "./InviteDialog";
import { JoinBoardDialog } from "./JoinBoardDialog";
import { LeaveBoardDialog } from "./LeaveBoardDialog";
import { ManageBoardSheet } from "./ManageBoardSheet";
import { RoleChip } from "./RoleChip";

type Props = {
  boards: BoardListItem[];
  activeBoard: Board;
};

export function BoardHeader({ boards, activeBoard }: Props) {
  const t = useTranslations("boards");
  const dialogParam = useBoardDialogParam();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(dialogParam === "create");
  const [joinOpen, setJoinOpen] = useState(dialogParam === "join");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canManage = canManageBoard(activeBoard.viewer.role);
  const showInvite = Boolean(activeBoard.join_code);

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <BoardSquare board={activeBoard} className="size-12 shrink-0 rounded-lg text-sm" />
          <div className="flex min-w-0 flex-1 flex-col">
            <BoardSwitcher
              boards={boards}
              activeBoard={activeBoard}
              onCreate={() => setCreateOpen(true)}
              onJoin={() => setJoinOpen(true)}
              trigger={
                <button
                  type="button"
                  aria-label={t("switcher.trigger")}
                  className="-mx-1.5 flex w-full items-center justify-between gap-1.5 rounded-md px-1.5 py-0.5 text-left transition-colors hover:bg-muted aria-expanded:bg-muted sm:w-auto sm:justify-start"
                >
                  <h1 className="font-heading text-xl font-bold tracking-tight max-sm:truncate sm:text-2xl">{activeBoard.name}</h1>
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              }
            />
            <div className="flex items-center gap-2 px-0.5">
              <span className="text-sm text-muted-foreground">{t("members", { count: activeBoard.member_count })}</span>
              <RoleChip role={activeBoard.viewer.role} />
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:shrink-0 sm:justify-end">
          <BoardHeaderAvatars board={activeBoard} />
          <div className="flex items-center gap-2">
            {showInvite ? (
              <Button variant="outline" size="sm" className="gap-1.5 px-3.5" onClick={() => setInviteOpen(true)}>
                <UserPlus className="size-4" aria-hidden />
                {t("switcher.invite")}
              </Button>
            ) : null}
            <BoardHeaderMenu board={activeBoard} onSettings={() => setSettingsOpen(true)} onLeave={() => setLeaveOpen(true)} onDelete={() => setDeleteOpen(true)} />
          </div>
        </div>
      </div>

      <InviteDialog board={activeBoard} open={inviteOpen} onOpenChange={setInviteOpen} />
      <CreateBoardDialog open={createOpen} onOpenChange={setCreateOpen} />
      <JoinBoardDialog open={joinOpen} onOpenChange={setJoinOpen} />
      <LeaveBoardDialog board={activeBoard} open={leaveOpen} onOpenChange={setLeaveOpen} />
      <DeleteBoardDialog board={activeBoard} open={deleteOpen} onOpenChange={setDeleteOpen} />
      {canManage ? <ManageBoardSheet board={activeBoard} open={settingsOpen} onOpenChange={setSettingsOpen} /> : null}
    </>
  );
}
