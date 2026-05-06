"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Star, Trophy, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { BoardPodium } from "@/features/boards/components/BoardPodium";
import { BoardRankingTable } from "@/features/boards/components/BoardRankingTable";
import { BoardSubheader } from "@/features/boards/components/BoardSubheader";
import { ShareBoardDialog } from "@/features/boards/components/ShareBoardDialog";
import { useBoardMembers } from "@/features/boards/hooks/useBoardMembers";
import { useRemoveMember } from "@/features/boards/hooks/useRemoveMember";
import { Board, BoardDetails, BoardMembersList } from "@/features/boards/types/board.types";
import { setLastVisitedBoardId } from "@/features/boards/utils/boardStorage";
import { getCurrentWorldCup2026Stage } from "@/shared/lib/utils/matchday";
import { getRankColor } from "@/shared/lib/utils/ui";

interface BoardDetailsViewProps {
  board: BoardDetails;
  boards: Board[];
  membersList: BoardMembersList;
  currentUserId: string;
  boardId: string;
}

export function BoardDetailsView({ board, boards, membersList, currentUserId, boardId }: BoardDetailsViewProps) {
  const t = useTranslations("boards");

  const { handleRemove } = useRemoveMember(String(board.id));
  const { data: paginatedData, handlePageChange, refresh: refreshMembers } = useBoardMembers(boardId, membersList);

  const refresh = useCallback(() => {
    refreshMembers();
  }, [refreshMembers]);

  const isGlobalBoard = (b: Board) => b.privacy === "public";

  const members = paginatedData?.members;
  const pagination = paginatedData?.pagination;
  const topThree = [...members].sort((a, b) => a.rank - b.rank).slice(0, 3);

  const currentState = getCurrentWorldCup2026Stage();
  useEffect(() => {
    setLastVisitedBoardId(boardId);
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
        value: paginatedData?.pagination.total.toString() || membersList.pagination.total.toString(),
      },
    ],
    [board.viewer.rank, board.viewer.total_points, paginatedData?.pagination.total, membersList.pagination.total, t]
  );

  return (
    <div className="flex flex-col gap-4">
      <BoardSubheader boards={boards} currentBoard={board} />
      <div className="flex flex-col gap-5 pt-0 p-4 sm:pt-0 sm:p-6 lg:pt-0 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ">
          <div>
            <p className="text-xs text-muted-foreground">
              {board.name} · {t(`matchday.${currentState}`)}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold">{t("details.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("details.subtitle")}</p>
          </div>
          {!isGlobalBoard(boards.find((b) => String(b.id) === boardId)!) && <ShareBoardDialog board={board} />}
        </div>
        <div className="flex items-center flex-row flex-wrap justify-center gap-4 my-6">
          {boardUserStats.map((stat) => (
            <div
              key={stat.id}
              className="flex w-45 items-center justify-center md:justify-start gap-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800">{stat.icon}</div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <span className={`text-2xl font-bold ${stat.id === "myPosition" ? getRankColor(board?.viewer.rank || 0, "text") : ""}`}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        <BoardPodium members={topThree} />

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
