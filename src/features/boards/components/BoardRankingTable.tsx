"use client";

import { useCallback, useMemo, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, MoreVertical, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { useUpdateMemberRole } from "@/features/boards/hooks/useUpdateMemberRole";
import { BoardMemberDetails } from "@/features/boards/types/board.types";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

interface BoardRankingTableProps {
  ownerId: string;
  members: BoardMemberDetails[];
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
  const { handleUpdateRole } = useUpdateMemberRole(boardId, onRefresh);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [mobileStatView, setMobileStatView] = useState<"total" | "pickem" | "matchScore" | "hits" | "outcomes">("total");

  const statOptions: Record<"total" | "pickem" | "matchScore" | "hits" | "outcomes", { label: string; key: keyof BoardMemberDetails }> = {
    total: { label: t("total"), key: "total_points" },
    pickem: { label: t("pickem"), key: "pickem_points" },
    matchScore: { label: t("matchScore"), key: "match_score_points" },
    hits: { label: t("hits"), key: "exact_hits" },
    outcomes: { label: t("outcomes"), key: "correct_outcomes" },
  };

  const statKeys = Object.keys(statOptions) as Array<keyof typeof statOptions>;
  const currentStatIndex = statKeys.indexOf(mobileStatView);

  const handlePreviousStat = () => {
    const newIndex = currentStatIndex === 0 ? statKeys.length - 1 : currentStatIndex - 1;
    setMobileStatView(statKeys[newIndex]);
  };

  const handleNextStat = () => {
    const newIndex = currentStatIndex === statKeys.length - 1 ? 0 : currentStatIndex + 1;
    setMobileStatView(statKeys[newIndex]);
  };

  const getActionsCell = useCallback(
    (member: BoardMemberDetails) => {
      const isCurrentUser = member.user_id === currentUserId;
      const isOwner = currentUserId === ownerId;
      const isAdmin = currentUserRole === "admin";
      const canManageRoles = isOwner || isAdmin;
      const memberIsOwner = member.user_id === ownerId;
      const memberIsAdmin = member.role === "admin";
      const canRemove = (canManageRoles && !memberIsOwner) || (isOwner && !memberIsOwner);
      const canChangeRole = isOwner || (isAdmin && !memberIsOwner && !memberIsAdmin);

      if (isCurrentUser || (!canRemove && !canChangeRole)) return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
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
    [t, currentUserId, ownerId, currentUserRole, handleUpdateRole, onRefresh, onRemoveMember]
  );

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  const showPagination = pagination && totalPages > 1;

  const columns: ColumnDef<BoardMemberDetails>[] = useMemo(
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
        cell: ({ row }) => getActionsCell(row.original),
      },
    ],
    [t, currentUserId, getActionsCell]
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
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("searchMembers")} value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 text-sm md:text-base" />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
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
                      minWidth:
                        header.column.id === "username" ? `${header.getSize()}px` : header.column.id === "actions" || header.column.id === "rank" ? "40px" : "110px",
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
                        minWidth:
                          cell.column.id === "username" ? `${cell.column.getSize()}px` : cell.column.id === "actions" || cell.column.id === "rank" ? "40px" : "110px",
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
                  {t("noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Table */}
      <div className="md:hidden rounded-lg border bg-card">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="text-xs uppercase text-muted-foreground w-10 p-1 rounded-tl-lg text-center">#</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground p-1">{t("member")}</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground text-center w-30 p-0">
                <div className="flex items-center justify-center h-full">
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={handlePreviousStat}>
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <span className="text-[10px] font-semibold min-w-0 flex-1 truncate px-0.5">{statOptions[mobileStatView].label}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={handleNextStat}>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="w-5 rounded-tr-lg"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const member = row.original;
                const isCurrentUser = member.user_id === currentUserId;
                const initials = member.username.slice(0, 2).toUpperCase();

                return (
                  <TableRow key={row.id}>
                    <TableCell className="text-center p-0">
                      <div className={`${isCurrentUser ? "text-gradient-secondary" : "text-muted-foreground"} text-xs font-medium`}>
                        {String(member.rank).padStart(2, "0")}
                      </div>
                    </TableCell>
                    <TableCell className="px-0 py-2">
                      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                        <Avatar className="h-7 w-7 shrink-0 hidden sm:block">
                          <AvatarFallback className="text-[10px] bg-muted">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 overflow-hidden">
                          <p className={`font-medium text-xs truncate ${isCurrentUser ? "text-gradient-secondary" : ""}`}>
                            {member?.first_name || ""} {member?.last_name || ""}
                          </p>
                          <p className={`text-[10px] text-muted-foreground truncate ${isCurrentUser ? "text-gradient-secondary" : ""}`}>@{member.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center p-0">
                      <div className="font-bold text-xs">{member[statOptions[mobileStatView].key] as number}</div>
                    </TableCell>
                    <TableCell className="p-0">{getActionsCell(member)}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {t("noResults")}
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
