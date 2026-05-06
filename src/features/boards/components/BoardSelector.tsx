"use client";

import { Check, ChevronDown, Globe, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { Board } from "@/features/boards/types/board.types";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";

import { setLastVisitedBoardId } from "../utils/boardStorage";

interface BoardSelectorProps {
  boards: Board[];
  currentBoardId: string;
  currentBoardName: string;
}

export function BoardSelector({ boards, currentBoardId, currentBoardName }: BoardSelectorProps) {
  const router = useRouter();

  const handleBoardChange = (boardId: string) => {
    setLastVisitedBoardId(boardId);
    router.push(`/boards/${boardId}`);
  };

  const currentBoardData = boards.find((b) => b.id === currentBoardId);
  const isGlobalBoard = currentBoardData?.privacy === "public";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-1 gap-2 hover:bg-muted/50 flex-1 min-w-0">
          {isGlobalBoard ? <Globe className="h-4 w-4 shrink-0" /> : <Users className="h-4 w-4 shrink-0" />}

          <span className="truncate min-w-0 text-xs md:text-md font-semibold">{currentBoardName}</span>

          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {boards.map((board) => {
          const isSelected = board.id === currentBoardId;
          const isBoardGlobal = board.privacy === "public";

          return (
            <DropdownMenuItem key={board.id} onClick={() => handleBoardChange(board.id)} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                {isBoardGlobal ? <Globe className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                <span>{board.name}</span>
              </div>
              {isSelected && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
