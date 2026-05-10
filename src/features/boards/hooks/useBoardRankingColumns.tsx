"use client";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { BoardDetails, BoardMemberDetails } from "@/features/boards/types/board.types";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";

import { MemberActionsCell } from "../components/MemberActionsCell";

interface UseBoardRankingColumnsProps {
  board: BoardDetails;
  currentUserId: string;
  onUpdateRole: (userId: string, newRole: "admin" | "member") => Promise<void>;
  onRemoveMember?: (userId: string) => void;
}

export function useBoardRankingColumns({ board, currentUserId, onUpdateRole, onRemoveMember }: UseBoardRankingColumnsProps) {
  const t = useTranslations("boards.ranking");

  return useMemo<ColumnDef<BoardMemberDetails>[]>(
    () => [
      {
        accessorKey: "rank",
        header: () => <div className="text-center">#</div>,
        size: 60,
        cell: ({ row }) => {
          const isCurrentUser = row.original.user_id === currentUserId;

          return (
            <div className={`text-center ${isCurrentUser ? "text-gradient-secondary" : "text-muted-foreground"} text-sm`}>
              {String(row.original.rank).padStart(2, "0")}
            </div>
          );
        },
      },
      {
        accessorKey: "username",
        header: t("member"),
        size: 300,
        cell: ({ row }) => {
          const member = row.original;
          const isCurrentUser = member.user_id === currentUserId;
          const initials = member.username.slice(0, 2).toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className={`font-medium text-sm ${isCurrentUser ? "text-gradient-secondary" : ""}`}>
                  {member?.first_name || ""} {member?.last_name || ""}
                </p>
                <p className={`text-xs text-muted-foreground ${isCurrentUser ? "text-gradient-secondary" : ""}`}>@{member.username}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "total_points",
        header: () => <div className="text-center">{t("total")}</div>,
        size: 150,
        cell: ({ row }) => <div className="text-center font-bold">{row.original.total_points}</div>,
      },
      {
        accessorKey: "pickem_points",
        header: () => <div className="text-center">{t("pickem")}</div>,
        size: 150,
        cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.pickem_points}</div>,
      },
      {
        accessorKey: "match_score_points",
        header: () => <div className="text-center">{t("matchScore")}</div>,
        size: 150,
        cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.match_score_points}</div>,
      },
      {
        accessorKey: "exact_hits",
        header: () => <div className="text-center">{t("hits")}</div>,
        size: 150,
        cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.exact_hits}</div>,
      },
      {
        accessorKey: "correct_outcomes",
        header: () => <div className="text-center">{t("outcomes")}</div>,
        size: 150,
        cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.correct_outcomes}</div>,
      },
      {
        id: "actions",
        size: 20,
        cell: ({ row }) => (
          <MemberActionsCell board={board} member={row.original} currentUserId={currentUserId} onUpdateRole={onUpdateRole} onRemoveMember={onRemoveMember} />
        ),
      },
    ],
    [t, board, currentUserId, onUpdateRole, onRemoveMember]
  );
}
