"use client";

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Check, ChevronDown, ChevronsUpDown, ChevronUp, Eye, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { displayName } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import { LEADERBOARD_PAGE_SIZE } from "../api/competitions";
import type { LeaderboardEntry } from "../types/competitions.types";

type Props = {
  columns: ColumnDef<LeaderboardEntry>[];
  rows: LeaderboardEntry[];
  currentUserId: string;
  isLoading: boolean;
  emptyLabel: string;
  sort: string;
  dir: "asc" | "desc";
  onSort: (key: string) => void;
  // When set, each row exposes an eye action to reveal that member's predictions.
  onViewMember?: (entry: LeaderboardEntry) => void;
};

export function LeaderboardTable({ columns, rows, currentUserId, isLoading, emptyLabel, sort, dir, onSort, onViewMember }: Props) {
  const tCols = useTranslations("competitions.leaderboard.columns");
  const tColsLong = useTranslations("competitions.leaderboard.columnsLong");
  const tLb = useTranslations("competitions.leaderboard");

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  const colCount = table.getVisibleLeafColumns().length + (onViewMember ? 1 : 0);

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
            {headerGroup.headers.map((header) => {
              const meta = header.column.columnDef.meta;
              const headerKey = header.column.columnDef.header as string;
              const isNumeric = headerKey !== "rank" && headerKey !== "member";
              const isActive = sort === headerKey;
              // Desktop has room for the full column name; the short `columns` set is for the mobile cycler.
              const label = isNumeric ? tColsLong(headerKey) : tCols(headerKey);
              return (
                <th
                  key={header.id}
                  aria-sort={isActive ? (dir === "asc" ? "ascending" : "descending") : undefined}
                  className={cn(
                    "px-4 py-2.5 whitespace-nowrap",
                    meta?.align === "left" && "text-left",
                    meta?.align === "right" && "text-right",
                    meta?.align === "center" && "text-center",
                    meta?.width
                  )}
                >
                  {isNumeric ? (
                    <button
                      type="button"
                      onClick={() => onSort(headerKey)}
                      className={cn("inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground", isActive && "text-foreground")}
                    >
                      {label}
                      {isActive ? (
                        dir === "asc" ? (
                          <ChevronUp className="size-3" aria-hidden />
                        ) : (
                          <ChevronDown className="size-3" aria-hidden />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3 text-muted-foreground/50" aria-hidden />
                      )}
                    </button>
                  ) : (
                    label
                  )}
                </th>
              );
            })}
            {onViewMember ? <th className="w-12" aria-hidden /> : null}
          </tr>
        ))}
      </thead>
      <tbody>
        {isLoading ? (
          Array.from({ length: LEADERBOARD_PAGE_SIZE }).map((_, i) => (
            <tr key={i} className="border-b border-border/60 last:border-b-0">
              {table.getVisibleLeafColumns().map((col) => {
                const meta = col.columnDef.meta;
                return (
                  <td key={col.id} className={cn("px-4 py-2.5", meta?.align === "right" && "text-right", meta?.align === "center" && "text-center")}>
                    {col.id === "member" ? (
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-2.5 w-20" />
                      </div>
                    ) : col.id === "rank" ? (
                      <Skeleton className="mx-auto h-4 w-5" />
                    ) : (
                      <Skeleton className="mx-auto h-4 w-8" />
                    )}
                  </td>
                );
              })}
              {onViewMember ? <td className="px-2" /> : null}
            </tr>
          ))
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={colCount} className="py-10 text-center text-sm text-muted-foreground">
              {emptyLabel}
            </td>
          </tr>
        ) : (
          table.getRowModel().rows.map((row) => {
            const isMe = row.original.member.user_id === currentUserId;
            return (
              <tr key={row.id} className={cn("border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted dark:hover:bg-muted", isMe && "bg-muted/40")}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  const isMember = cell.column.id === "member";
                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-2.5 tabular-nums",
                        meta?.align === "right" && "text-right",
                        meta?.align === "center" && "text-center",
                        meta?.emphasize && "font-semibold text-foreground",
                        isMember && "font-medium"
                      )}
                    >
                      {isMember ? (
                        <MemberCell entry={row.original} isMe={isMe} />
                      ) : meta?.display === "check" ? (
                        <CheckCell value={cell.getValue() as number} />
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </td>
                  );
                })}
                {onViewMember ? (
                  <td className="px-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-page-accent-strong hover:bg-muted hover:text-page-accent"
                      aria-label={tLb("viewMember", { name: displayName(row.original.member.username, row.original.member.first_name, row.original.member.last_name) })}
                      onClick={() => onViewMember(row.original)}
                    >
                      <Eye className="size-4" aria-hidden />
                    </Button>
                  </td>
                ) : null}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

function CheckCell({ value }: { value: number }) {
  return value === 1 ? (
    <Check className="mx-auto size-4 text-lime-600 dark:text-lime-400" aria-hidden />
  ) : (
    <X className="mx-auto size-4 text-muted-foreground/40" aria-hidden />
  );
}

function MemberCell({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const t = useTranslations("competitions.leaderboard");
  return (
    <span className="flex min-w-0 flex-col leading-tight">
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate">{displayName(entry.member.username, entry.member.first_name, entry.member.last_name)}</span>
        {isMe ? <span className="rounded-md bg-page-accent p-1 text-2xs font-medium uppercase tracking-wide text-white">{t("you")}</span> : null}
      </span>
      <span className="truncate text-xs text-muted-foreground">@{entry.member.username}</span>
    </span>
  );
}
