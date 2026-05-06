"use client";

import { useMemo, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, MoreVertical, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { useUpdateMemberRole } from "@/features/boards/hooks/useUpdateMemberRole";
import { BoardMember, BoardRole } from "@/features/boards/types/board.types";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

interface BoardRankingTableProps {
  ownerId: string;
  members: BoardMember[];
  currentUserId: string;
  currentUserRole: string;
  boardId: string;
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
  ownerId,
  members,
  currentUserId,
  currentUserRole,
  boardId,
  onRemoveMember,
  onRefresh,
  pagination,
  onPageChange,
}: BoardRankingTableProps) {
  const t = useTranslations("boards.ranking");
  const { handleUpdateRole } = useUpdateMemberRole(boardId);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  const showPagination = pagination && totalPages > 1;

  const columns: ColumnDef<BoardMember>[] = useMemo(
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
        size: 100,
        cell: ({ row }) => <div className="text-center font-bold">{row.original.total_points}</div>,
      },
      {
        accessorKey: "pickem_points",
        header: () => <div className="text-center">{t("pickem")}</div>,
        size: 100,
        cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.pickem_points}</div>,
      },
      {
        accessorKey: "match_score_points",
        header: () => <div className="text-center">{t("matchScore")}</div>,
        size: 130,
        cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.match_score_points}</div>,
      },
      {
        accessorKey: "exact_hits",
        header: () => <div className="text-center">{t("hits")}</div>,
        size: 80,
        cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.exact_hits}</div>,
      },
      {
        accessorKey: "correct_outcomes",
        header: () => <div className="text-center">{t("outcomes")}</div>,
        size: 110,
        cell: ({ row }) => <div className="text-center text-muted-foreground">{row.original.correct_outcomes}</div>,
      },
      {
        id: "actions",
        size: 30,
        cell: ({ row }) => {
          const member = row.original;
          const isCurrentUser = member.user_id === currentUserId;
          const isOwner = currentUserId === ownerId;
          const isAdmin = currentUserRole === BoardRole.ADMIN;
          const canManageRoles = isOwner || isAdmin;
          const memberIsOwner = member.user_id === ownerId;
          const memberIsAdmin = member.role === BoardRole.ADMIN;

          const canRemove = (canManageRoles && !memberIsOwner) || (isOwner && !memberIsOwner);
          const canChangeRole = isOwner || (isAdmin && !memberIsOwner && !memberIsAdmin);

          if (isCurrentUser || (!canRemove && !canChangeRole)) return null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 text-center align-middle">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canChangeRole && (
                  <DropdownMenuItem
                    onClick={async () => {
                      const newRole = memberIsAdmin ? "member" : "admin";
                      await handleUpdateRole(member.user_id, newRole);
                      onRefresh?.();
                    }}
                  >
                    {memberIsAdmin ? t("makeMember") : t("makeAdmin")}
                  </DropdownMenuItem>
                )}
                {canRemove && (
                  <DropdownMenuItem onClick={() => onRemoveMember?.(member.user_id)} className="text-destructive">
                    {t("removeMember")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, onRemoveMember, currentUserId, handleUpdateRole, currentUserRole, ownerId, onRefresh]
  );

  //eslint-disable-next-line
  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    columnResizeMode: "onChange",
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-8 md:gap-2">
        <h3 className="font-semibold">{t("leaderboard")}</h3>
        <div className="relative flex-1 max-w-3xs md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("searchMembers")} value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`text-xs uppercase text-muted-foreground ${header.column.id === "username" ? "w-auto" : ""}`}
                    style={{
                      width: header.column.id === "username" ? undefined : `${header.getSize()}px`,
                      minWidth: header.column.id === "username" ? `${header.getSize()}px` : undefined,
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === "username" ? "w-auto" : ""}
                      style={{
                        width: cell.column.id === "username" ? undefined : `${cell.column.getSize()}px`,
                        minWidth: cell.column.id === "username" ? `${cell.column.getSize()}px` : undefined,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("ranking.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-4">
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
