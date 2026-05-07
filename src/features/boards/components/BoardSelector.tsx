"use client";

import { useState } from "react";
import { Check, ChevronDown, Globe, Plus, SquareArrowRightEnter, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Board } from "@/features/boards/types/board.types";
import { setLastVisitedBoardId } from "@/features/boards/utils/boardStorage";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";

import { CreateBoardDialog } from "./CreateBoardDialog";
import { JoinBoardDialog } from "./JoinBoardDialog";

interface BoardSelectorProps {
  boards: Board[];
  currentBoardId: string;
  currentBoardName: string;
}

export function BoardSelector({ boards, currentBoardId, currentBoardName }: BoardSelectorProps) {
  const router = useRouter();
  const t = useTranslations("boards.selector");
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const handleBoardChange = (boardId: string) => {
    setLastVisitedBoardId(boardId);
    router.push(`/boards/${boardId}`);
    setOpen(false);
  };

  const currentBoardData = boards.find((b) => b.id === currentBoardId);
  const isGlobalBoard = currentBoardData?.privacy === "public";
  const otherBoards = boards.filter((b) => b.id !== currentBoardId);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-auto py-2 px-3 gap-2 hover:bg-muted/50 min-w-0 bg-background">
          {isGlobalBoard ? <Globe className="h-4 w-4 shrink-0" /> : <Users className="h-4 w-4 shrink-0" />}
          <span className="truncate min-w-0 text-sm md:text-md font-semibold">{currentBoardName}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 p-0">
        {/* Current Board Section */}
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("currentBoard")}</p>
          <div className="flex items-center justify-between py-2 px-2 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              {isGlobalBoard ? <Globe className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              <span className="font-medium">{currentBoardName}</span>
            </div>
            <Check className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Other Boards Section */}
        {otherBoards.length > 0 && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("otherBoards")}</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {otherBoards
                  .sort((a) => (a.privacy === "public" ? -1 : 1))
                  .map((board) => {
                    const isBoardGlobal = board.privacy === "public";

                    return (
                      <DropdownMenuItem key={board.id} onClick={() => handleBoardChange(board.id)} className="flex items-center gap-2 cursor-pointer">
                        {isBoardGlobal ? <Globe className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                        <span>{board.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <DropdownMenuSeparator className="my-0" />
        <div className="p-2 space-y-1">
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              setCreateDialogOpen(true);
            }}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span className="font-medium">{t("createBoard")}</span>
              <span className="text-xs text-muted-foreground">{t("createBoardHint")}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              setJoinDialogOpen(true);
            }}
            className="cursor-pointer"
          >
            <SquareArrowRightEnter className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span className="font-medium">{t("joinBoard")}</span>
              <span className="text-xs text-muted-foreground">{t("joinBoardHint")}</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>

      {/* Dialogs controlled by action buttons */}
      <CreateBoardDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <JoinBoardDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />
    </DropdownMenu>
  );
}
