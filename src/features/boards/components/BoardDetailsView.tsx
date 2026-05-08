"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { Star, Trophy, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { BoardErrorHandler } from "@/features/boards/components/BoardErrorHandler";
import { BoardPodium } from "@/features/boards/components/BoardPodium";
import { BoardRankingTable } from "@/features/boards/components/BoardRankingTable";
import { BoardSubheader } from "@/features/boards/components/BoardSubheader";
import { useBoardMembers } from "@/features/boards/hooks/useBoardMembers";
import { useRemoveMember } from "@/features/boards/hooks/useRemoveMember";
import { Board, BoardDetails, BoardMemberDetails } from "@/features/boards/types/board.types";
import { setLastVisitedBoardId } from "@/features/boards/utils/boardStorage";
import { Pagination } from "@/shared/lib/api/types";
import { getRankColor } from "@/shared/lib/utils/ui";

import { LAST_VISITED_BOARD_KEY } from "../constants/boards";

interface BoardDetailsViewProps {
  board: BoardDetails;
  boards: Board[];
  initialMembers: BoardMemberDetails[];
  initialPagination: Pagination;
  currentUserId: string;
  boardId: string;
}

export function BoardDetailsView({ board, boards, initialMembers, initialPagination, currentUserId, boardId }: BoardDetailsViewProps) {
  const t = useTranslations("boards");

  const { members, pagination, handlePageChange, refresh: refreshMembers } = useBoardMembers(boardId, initialMembers, initialPagination);

  const refresh = useCallback(() => {
    refreshMembers();
  }, [refreshMembers]);

  const { handleRemove } = useRemoveMember(board.id, refresh);

  const topThreeMembers = useMemo(() => {
    return [...initialMembers].sort((a, b) => a.rank - b.rank).slice(0, 3);
  }, [initialMembers]);

  useEffect(() => {
    setLastVisitedBoardId(boardId);
    // Also set cookie for server-side redirect optimization
    document.cookie = `${LAST_VISITED_BOARD_KEY}=${boardId}; path=/; max-age=2592000`; // 30 days
  }, [boardId]);

  const boardUserStats = useMemo(
    () => [
      {
        id: "myPosition",
        icon: <Trophy className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />,
        label: t("subheader.myPosition"),
        value: `#${board.viewer.rank}`,
      },
      {
        id: "totalPoints",
        icon: <Star className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />,
        label: t("subheader.totalPoints"),
        value: board.viewer.total_points.toString(),
      },
      {
        id: "members",
        icon: <Users className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />,
        label: t("subheader.members"),
        value: pagination.total.toString(),
      },
    ],
    [board.viewer.rank, board.viewer.total_points, pagination.total, t]
  );

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={null}>
        <BoardErrorHandler />
      </Suspense>
      <BoardSubheader boards={boards} currentBoard={board} currentUserId={currentUserId} currentUserRole={board.viewer.role} />
      <div className="flex flex-col gap-5 pt-0 p-4 sm:pt-0 sm:p-6 lg:pt-0 lg:p-8">
        <div className="flex items-center flex-row justify-center gap-4">
          {boardUserStats.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-row w-30 md:w-45 items-center justify-center md:justify-start gap-2 md:gap-3  p-2 sm:p-3 md:p-4  rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-100 dark:bg-zinc-800">{stat.icon}</div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xs text-muted-foreground hidden md:flex">{stat.label}</span>
                <span className={`md:text-lg lg:text-xl xl:text-2xl font-bold ${stat.id === "myPosition" ? getRankColor(board?.viewer.rank || 0, "text") : ""}`}>
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <BoardPodium members={topThreeMembers} />

        <BoardRankingTable
          ownerId={board.owner_user_id || ""}
          members={members}
          currentUserId={currentUserId}
          currentUserRole={board.viewer.role}
          boardId={boardId}
          onRemoveMember={handleRemove}
          onRefresh={refresh}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
