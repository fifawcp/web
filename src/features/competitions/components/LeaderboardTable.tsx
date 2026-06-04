"use client";

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

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
};

export function LeaderboardTable({ columns, rows, currentUserId, isLoading, emptyLabel }: Props) {
  const tCols = useTranslations("competitions.leaderboard.columns");
  const tColsLong = useTranslations("competitions.leaderboard.columnsLong");

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  const colCount = table.getVisibleLeafColumns().length;

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-border bg-muted/40 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
            {headerGroup.headers.map((header) => {
              const meta = header.column.columnDef.meta;
              const headerKey = header.column.columnDef.header as string;
              const isNumeric = headerKey !== "rank" && headerKey !== "member";
              return (
                <th
                  key={header.id}
                  title={isNumeric ? tColsLong(headerKey) : undefined}
                  className={cn(
                    "px-4 py-2.5 whitespace-nowrap",
                    meta?.align === "left" && "text-left",
                    meta?.align === "right" && "text-right",
                    meta?.align === "center" && "text-center",
                    meta?.width
                  )}
                >
                  {tCols(headerKey)}
                </th>
              );
            })}
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
                      {isMember ? <MemberCell entry={row.original} isMe={isMe} /> : flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
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
