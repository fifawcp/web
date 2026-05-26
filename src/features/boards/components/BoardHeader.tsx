"use client";

import { useState } from "react";

import { useBoardDialogParam } from "../hooks/useBoardDialogParam";
import { canManageBoard } from "../lib/boardRole";
import type { Board, BoardListItem } from "../types/boards.types";

import { BoardSwitcher } from "./BoardSwitcher";
import { CreateBoardDialog } from "./CreateBoardDialog";
import { InviteDialog } from "./InviteDialog";
import { JoinBoardDialog } from "./JoinBoardDialog";
import { LeaveBoardDialog } from "./LeaveBoardDialog";
import { ManageBoardSheet } from "./ManageBoardSheet";

type Props = {
  boards: BoardListItem[];
  activeBoard: Board;
  currentUserId: string;
  className?: string;
};

export function BoardHeader({ boards, activeBoard, currentUserId, className }: Props) {
  const dialogParam = useBoardDialogParam();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(dialogParam === "create");
  const [joinOpen, setJoinOpen] = useState(dialogParam === "join");
  const [manageOpen, setManageOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const showManage = canManageBoard(activeBoard.viewer.role);

  return (
    <>
      <BoardSwitcher
        boards={boards}
        activeBoard={activeBoard}
        onInvite={() => setInviteOpen(true)}
        onManage={() => setManageOpen(true)}
        onLeave={() => setLeaveOpen(true)}
        onCreate={() => setCreateOpen(true)}
        onJoin={() => setJoinOpen(true)}
        className={className}
      />

      <InviteDialog board={activeBoard} open={inviteOpen} onOpenChange={setInviteOpen} />
      <CreateBoardDialog open={createOpen} onOpenChange={setCreateOpen} />
      <JoinBoardDialog open={joinOpen} onOpenChange={setJoinOpen} />
      <LeaveBoardDialog board={activeBoard} open={leaveOpen} onOpenChange={setLeaveOpen} />
      {showManage ? <ManageBoardSheet board={activeBoard} currentUserId={currentUserId} open={manageOpen} onOpenChange={setManageOpen} /> : null}
    </>
  );
}
