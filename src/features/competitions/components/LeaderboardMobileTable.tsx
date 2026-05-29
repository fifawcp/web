"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

import { LEADERBOARD_PAGE_SIZE } from "../api/competitions";
import type { MobileCyclableColumn } from "../lib/competitionColumns";
import type { LeaderboardEntry } from "../types/competitions.types";

type Props = {
  rows: LeaderboardEntry[];
  cyclableColumns: MobileCyclableColumn[];
  currentUserId: string;
  isLoading: boolean;
  emptyLabel: string;
};

export function LeaderboardMobileTable({ rows, cyclableColumns, currentUserId, isLoading, emptyLabel }: Props) {
  const t = useTranslations("competitions.leaderboard");
  const tCols = useTranslations("competitions.leaderboard.columns");
  const [activeColumn, setActiveColumn] = useState(0);

  const active = cyclableColumns[activeColumn] ?? cyclableColumns[0];
  const prevIdx = (activeColumn - 1 + cyclableColumns.length) % cyclableColumns.length;
  const nextIdx = (activeColumn + 1) % cyclableColumns.length;
  const prevLabel = cyclableColumns[prevIdx]?.labelKey ?? "";
  const nextLabel = cyclableColumns[nextIdx]?.labelKey ?? "";

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border px-2 pb-2 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        <span className="w-9">{t("columns.rank")}</span>
        <span>{t("columns.member")}</span>
        <div className="flex w-24 items-center justify-between gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setActiveColumn(prevIdx)}
            disabled={cyclableColumns.length <= 1}
            aria-label={t("mobile.prevColumn", { name: tCols(prevLabel) })}
            className="size-6 shrink-0"
          >
            <ChevronLeft className="size-3.5" aria-hidden />
          </Button>
          <span className="flex-1 text-center tabular-nums">{tCols(active.labelKey)}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setActiveColumn(nextIdx)}
            disabled={cyclableColumns.length <= 1}
            aria-label={t("mobile.nextColumn", { name: tCols(nextLabel) })}
            className="size-6 shrink-0"
          >
            <ChevronRight className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <ul className="divide-y divide-border">
          {Array.from({ length: LEADERBOARD_PAGE_SIZE }).map((_, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-2 py-2.5">
              <span className="w-9">
                <Skeleton className="h-3.5 w-6" />
              </span>
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-2.5 w-16" />
              </div>
              <span className="flex w-24 justify-center">
                <Skeleton className="h-4 w-10" />
              </span>
            </li>
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((entry) => {
            const isMe = entry.member.user_id === currentUserId;
            const displayName = [entry.member.first_name, entry.member.last_name].filter(Boolean).join(" ") || entry.member.username;
            return (
              <li key={entry.member.user_id} className={cn("grid grid-cols-[auto_1fr_auto] items-center gap-3 px-2 py-2.5", isMe && "bg-page-accent-soft/60")}>
                <span className="w-9 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">{String(entry.rank).padStart(2, "0")}</span>
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className={cn("truncate text-sm font-medium", isMe && "text-page-accent-strong")}>{displayName}</span>
                    {isMe ? <span className="rounded-md bg-page-accent p-1 text-2xs font-medium uppercase tracking-wide text-white">{t("you")}</span> : null}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">@{entry.member.username}</span>
                </div>
                <span className="w-24 text-center text-base font-semibold tabular-nums">{active.value(entry).toLocaleString()}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
