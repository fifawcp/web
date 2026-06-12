"use client";

import { useState, type TouchEvent } from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check, ChevronLeft, ChevronRight, MoveHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { displayName } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import { LEADERBOARD_PAGE_SIZE } from "../api/competitions";

import { MemberNameLink } from "./MemberNameLink";

export type MobileLeaderboardMember = {
  user_id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
};

export type MobileLeaderboardColumn<T> = {
  id: string;
  label: string; // already translated
  value: (row: T) => number;
  // "check" renders the 0|1 value as a ✓/✗ instead of a number (awards).
  display?: "check";
};

type Props<T> = {
  boardId: number;
  rows: T[];
  columns: MobileLeaderboardColumn<T>[];
  getMember: (row: T) => MobileLeaderboardMember;
  getRank: (row: T) => number;
  currentUserId: string;
  isLoading: boolean;
  emptyLabel: string;
  sort: string;
  dir: "asc" | "desc";
  onSort: (key: string) => void;
};

// Fixed rank + metric columns so the value (and the header sort control) center in
// the same column across header and every row; the member column absorbs the slack.
const GRID = "grid grid-cols-[2.25rem_1fr_7.5rem] items-center gap-3";

// One metric is visible at a time: the arrows (or a swipe) cycle which column,
// and the "Order" line flips the sort direction. Shared by the competition
// leaderboard and the board summary so both read the same on mobile.
export function LeaderboardMobileTable<T>({ boardId, rows, columns, getMember, getRank, currentUserId, isLoading, emptyLabel, sort, dir, onSort }: Props<T>) {
  const t = useTranslations("competitions.leaderboard");

  const activeIdx = Math.max(
    0,
    columns.findIndex((c) => c.id === sort)
  );
  const active = columns[activeIdx] ?? columns[0];
  const prev = columns[(activeIdx - 1 + columns.length) % columns.length];
  const next = columns[(activeIdx + 1) % columns.length];
  const single = columns.length <= 1;

  // Swipe left → next metric, right → previous (mirrors the chevron buttons).
  const [touchX, setTouchX] = useState<number | null>(null);
  function onTouchEnd(e: TouchEvent) {
    if (touchX === null || single) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) onSort((dx < 0 ? next : prev).id);
    setTouchX(null);
  }

  if (!active) return null;

  return (
    <div className="flex flex-col" onTouchStart={(e) => setTouchX(e.touches[0].clientX)} onTouchEnd={onTouchEnd}>
      <div className={cn(GRID, "border-b border-border pb-2.5")}>
        <span className="text-center text-2xs font-semibold tracking-wide text-muted-foreground uppercase">{t("columns.rank")}</span>
        <span className="text-2xs font-semibold tracking-wide text-muted-foreground uppercase">{t("columns.member")}</span>
        <div className="flex min-w-0 items-center justify-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onSort(prev.id)}
            disabled={single}
            aria-label={t("mobile.prevColumn", { name: prev.label })}
            className="size-6 shrink-0"
          >
            <ChevronLeft className="size-3.5" aria-hidden />
          </Button>
          {/* Tapping the active column flips the sort direction; the accent sort icon shows which way. */}
          <button
            type="button"
            onClick={() => onSort(active.id)}
            aria-label={t("mobile.toggleSort")}
            className="flex min-w-0 items-center gap-1 text-xs font-semibold text-foreground transition-colors hover:text-muted-foreground"
          >
            <span className="truncate">{active.label}</span>
            {dir === "asc" ? (
              <ArrowUpNarrowWide className="size-3.5 shrink-0 text-page-accent-strong" aria-hidden />
            ) : (
              <ArrowDownWideNarrow className="size-3.5 shrink-0 text-page-accent-strong" aria-hidden />
            )}
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onSort(next.id)}
            disabled={single}
            aria-label={t("mobile.nextColumn", { name: next.label })}
            className="size-6 shrink-0"
          >
            <ChevronRight className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <ul className="divide-y divide-border">
          {Array.from({ length: LEADERBOARD_PAGE_SIZE }).map((_, i) => (
            <li key={i} className={cn(GRID, "py-2.5")}>
              <Skeleton className="h-3.5 w-7 justify-self-center" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-2.5 w-16" />
              </div>
              <Skeleton className="h-5 w-8 justify-self-center" />
            </li>
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row) => {
            const member = getMember(row);
            const rank = getRank(row);
            const isMe = member.user_id === currentUserId;
            return (
              <li key={member.user_id} className={cn(GRID, "py-2.5", isMe && "bg-page-accent-soft/60")}>
                <span className="text-center text-xs font-medium text-muted-foreground tabular-nums">{String(rank).padStart(2, "0")}</span>
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <MemberNameLink
                      boardId={boardId}
                      userId={member.user_id}
                      currentUserId={currentUserId}
                      name={displayName(member.username, member.first_name, member.last_name)}
                      username={member.username}
                      className={cn("text-sm font-medium", isMe && "text-page-accent-strong")}
                    />
                    {isMe ? <span className="rounded-md bg-page-accent p-1 text-2xs font-medium tracking-wide text-white uppercase">{t("you")}</span> : null}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">@{member.username}</span>
                </div>
                <span className="flex justify-center text-sm font-semibold tabular-nums">
                  {active.display === "check" ? (
                    active.value(row) === 1 ? (
                      <Check className="size-4 text-lime-600 dark:text-lime-400" aria-hidden />
                    ) : (
                      <X className="size-4 text-muted-foreground/40" aria-hidden />
                    )
                  ) : (
                    active.value(row).toLocaleString()
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!single && !isLoading && rows.length > 0 ? (
        <div className="mt-1 flex items-center justify-center gap-2 border-t border-border/60 pt-3 text-2xs text-muted-foreground">
          <MoveHorizontal className="size-3.5 shrink-0 text-page-accent-strong" aria-hidden />
          <span>{t("mobile.hint")}</span>
        </div>
      ) : null}
    </div>
  );
}
