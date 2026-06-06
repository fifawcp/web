"use client";

import { useState } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp, Crown, Search, User, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { displayName, getInitials } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import { LEADERBOARD_PAGE_SIZE } from "../api/competitions";
import { useBoardSummary } from "../hooks/useBoardSummary";
import type { BoardSummaryEntry } from "../types/competitions.types";

import { LeaderboardPagination } from "./LeaderboardPagination";

// Which per-type subtotal columns the board has (custom = match competitions).
export type SummaryColumn = "pickem" | "custom" | "pick" | "awards";

type SortKey = SummaryColumn | "total";
type SortDir = "asc" | "desc";

type Props = {
  boardId: number;
  currentUserId: string;
  columns: SummaryColumn[];
  enabled: boolean;
};

export function BoardSummaryTab({ boardId, currentUserId, columns, enabled }: Props) {
  const t = useTranslations("competitions.leaderboard");
  const tCol = useTranslations("competitions.summary.columns");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("total");
  const [dir, setDir] = useState<SortDir>("desc");
  const debouncedQ = useDebounce(q, 250);

  const query = useBoardSummary({ boardId, page, q: debouncedQ, sort, dir, enabled });
  const items = query.data?.items ?? [];
  const totalCount = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LEADERBOARD_PAGE_SIZE));
  const isLoading = query.isFetching && items.length === 0;
  const emptyLabel = debouncedQ.length > 0 ? t("noResults") : t("empty");

  // Sortable keys in display order: the per-type subtotals, then the overall total.
  const sortKeys: SortKey[] = [...columns, "total"];
  const sortLabel = (key: SortKey) => (key === "total" ? t("columns.total") : tCol(key));

  function onSearch(value: string) {
    setQ(value);
    setPage(1);
  }

  // Click a new column → sort it descending; click the active column → flip direction.
  function onSort(key: SortKey) {
    if (key === sort) {
      setDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSort(key);
      setDir("desc");
    }
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="relative sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => onSearch(e.target.value)} placeholder={t("search")} className="h-9 pl-9" />
        {q ? (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t("search")}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-xs">
        {/* Desktop */}
        <table className="hidden w-full border-collapse text-sm md:table">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="w-12 px-4 py-2.5 text-center">{t("columns.rank")}</th>
              <th className="w-full px-4 py-2.5 text-left">{t("columns.member")}</th>
              {columns.map((col) => (
                <SortHeader key={col} label={tCol(col)} active={sort === col} dir={dir} onClick={() => onSort(col)} />
              ))}
              <SortHeader label={t("columns.total")} active={sort === "total"} dir={dir} onClick={() => onSort("total")} />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: LEADERBOARD_PAGE_SIZE }).map((_, i) => (
                <tr key={i} className="border-b border-border/60 last:border-b-0">
                  <td className="px-4 py-2.5 text-center">
                    <Skeleton className="mx-auto h-4 w-5" />
                  </td>
                  <td className="px-4 py-2.5">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2.5 text-center">
                      <Skeleton className="mx-auto h-4 w-8" />
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-center">
                    <Skeleton className="mx-auto h-4 w-8" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 3} className="py-10 text-center text-sm text-muted-foreground">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              items.map((entry) => {
                const isMe = entry.member.user_id === currentUserId;
                return (
                  <tr
                    key={entry.member.user_id}
                    className={cn("border-b border-border/60 tabular-nums transition-colors last:border-b-0 hover:bg-muted", isMe && "bg-muted/40")}
                  >
                    <td className="px-4 py-2.5 text-center">
                      <RankBadge rank={entry.rank} />
                    </td>
                    <td className="px-4 py-2.5">
                      <MemberCell entry={entry} isMe={isMe} youLabel={t("you")} />
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-2.5 text-center text-muted-foreground">
                        {entry[col].toLocaleString()}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-center font-semibold text-foreground">{entry.total.toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2.5">
            {sortKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onSort(key)}
                aria-pressed={sort === key}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-2xs font-medium transition-colors",
                  sort === key ? "border-page-accent-strong/30 bg-page-accent-soft text-page-accent-strong" : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {sortLabel(key)}
                {sort === key ? <DirChevron dir={dir} /> : null}
              </button>
            ))}
          </div>
          {isLoading ? (
            <ul className="divide-y divide-border">
              {Array.from({ length: LEADERBOARD_PAGE_SIZE }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="h-3.5 w-6" />
                  <Skeleton className="h-9 flex-1" />
                </li>
              ))}
            </ul>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((entry) => {
                const isMe = entry.member.user_id === currentUserId;
                return (
                  <li key={entry.member.user_id} className={cn("flex items-center gap-3 px-3 py-2.5", isMe && "bg-page-accent-soft/60")}>
                    <span className="w-6 shrink-0 text-center">
                      <RankBadge rank={entry.rank} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <MemberCell entry={entry} isMe={isMe} youLabel={t("you")} />
                      <span className="flex flex-wrap gap-x-2 text-2xs text-muted-foreground tabular-nums">
                        {columns.map((col) => (
                          <span key={col}>
                            {tCol(col)} {entry[col].toLocaleString()}
                          </span>
                        ))}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-base font-semibold tabular-nums">{entry.total.toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {totalPages > 1 ? (
          <div className="border-t border-border/60 px-4 py-3">
            <LeaderboardPagination
              page={page}
              totalPages={totalPages}
              shown={items.length}
              total={totalCount}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              isFetching={query.isFetching}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SortHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <th className="w-20 px-4 py-2.5 text-center whitespace-nowrap" aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}>
      <button
        type="button"
        onClick={onClick}
        className={cn("inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-foreground", active && "text-foreground")}
      >
        {label}
        {active ? <DirChevron dir={dir} /> : <ChevronsUpDown className="size-3 text-muted-foreground/50" aria-hidden />}
      </button>
    </th>
  );
}

function DirChevron({ dir }: { dir: SortDir }) {
  return dir === "asc" ? <ChevronUp className="size-3" aria-hidden /> : <ChevronDown className="size-3" aria-hidden />;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="mx-auto size-4 text-page-accent-strong" aria-hidden />;
  return <span className="font-mono text-xs font-semibold text-muted-foreground">{rank}</span>;
}

function MemberCell({ entry, isMe, youLabel }: { entry: BoardSummaryEntry; isMe: boolean; youLabel: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar className="size-6 border border-border">
        <AvatarFallback className="bg-card text-2xs font-semibold text-foreground">
          {getInitials(entry.member.username, entry.member.first_name ?? undefined, entry.member.last_name ?? undefined) || (
            <User className="size-3 text-muted-foreground" aria-hidden />
          )}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate font-medium">{displayName(entry.member.username, entry.member.first_name, entry.member.last_name)}</span>
      {isMe ? <span className="shrink-0 rounded-md bg-page-accent p-1 text-2xs font-medium uppercase tracking-wide text-white">{youLabel}</span> : null}
    </span>
  );
}
