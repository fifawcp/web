"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { useUpdateMemberRole } from "@/features/boards/hooks/useUpdateMemberRole";
import { BoardDetails, BoardMemberDetails } from "@/features/boards/types/board.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

import { BoardRankingTableDesktop } from "./BoardRankingTableDesktop";
import { BoardRankingTableMobile } from "./BoardRankingTableMobile";

interface BoardRankingTableProps {
  board: BoardDetails;
  members: BoardMemberDetails[];
  currentUserId: string;
  search: string;
  onSearchChange: (search: string) => void;
  onRemoveMember?: (userId: string) => void;
  onRefresh?: () => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
  onPageChange?: (page: number) => void;
}

export function BoardRankingTable({
  board,
  members,
  currentUserId,
  search,
  onSearchChange,
  onRemoveMember,
  onRefresh,
  pagination,
  onPageChange,
}: BoardRankingTableProps) {
  const t = useTranslations("boards.ranking");
  const { handleUpdateRole } = useUpdateMemberRole(board.id, onRefresh);

  const handleUpdateRoleWithRefresh = async (userId: string, newRole: "admin" | "member") => {
    await handleUpdateRole(userId, newRole);
    onRefresh?.();
  };

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;
  const showPagination = pagination && totalPages > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("searchMembers")} value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 text-sm md:text-base" />
      </div>

      <BoardRankingTableDesktop
        board={board}
        members={members}
        currentUserId={currentUserId}
        onUpdateRole={handleUpdateRoleWithRefresh}
        onRemoveMember={onRemoveMember}
      />

      <BoardRankingTableMobile board={board} members={members} currentUserId={currentUserId} onUpdateRole={handleUpdateRoleWithRefresh} onRemoveMember={onRemoveMember} />

      {showPagination && (
        <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-2 md:gap-4">
          <p className="text-sm text-muted-foreground">
            {t("pagination.showing")} {(currentPage - 1) * pagination.limit + 1}-{Math.min(currentPage * pagination.limit, pagination.total)} {t("pagination.of")}{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
              {t("pagination.previous")}
            </Button>
            <span className="text-sm">
              {t("pagination.page")} {currentPage} {t("pagination.of")} {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => onPageChange?.(currentPage + 1)} disabled={!pagination.has_more}>
              {t("pagination.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
