"use client";

import { useState } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp, Crown, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { displayName } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import { LEADERBOARD_PAGE_SIZE } from "../api/competitions";
import { useBoardSummary } from "../hooks/useBoardSummary";
import type { BoardSummaryEntry } from "../types/competitions.types";

import { LeaderboardMobileTable, type MobileLeaderboardColumn } from "./LeaderboardMobileTable";
import { LeaderboardPagination } from "./LeaderboardPagination";
import { MemberNameLink } from "./MemberNameLink";

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

  // Mobile cycler columns: the per-type subtotals, then the overall total.
  const mobileColumns: MobileLeaderboardColumn<BoardSummaryEntry>[] = [
    ...columns.map((col) => ({ id: col, label: tCol(col), value: (e: BoardSummaryEntry) => e[col] })),
    { id: "total", label: t("columns.total"), value: (e: BoardSummaryEntry) => e.total },
  ];

  function onSearch(value: string) {
    setQ(value);
    setPage(1);
  }

  // Click a new column → sort it descending; click the active column → flip direction.
  // `key` is always a valid SortKey (column id); typed as string to match the shared cycler.
  function onSort(key: string) {
    if (key === sort) {
      setDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSort(key as SortKey);
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
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
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
                      <MemberCell entry={entry} isMe={isMe} youLabel={t("you")} boardId={boardId} currentUserId={currentUserId} />
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
        <div className="p-4 md:hidden">
          <LeaderboardMobileTable
            boardId={boardId}
            rows={items}
            columns={mobileColumns}
            getMember={(row) => row.member}
            getRank={(row) => row.rank}
            currentUserId={currentUserId}
            isLoading={isLoading}
            emptyLabel={emptyLabel}
            sort={sort}
            dir={dir}
            onSort={onSort}
          />
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

function MemberCell({
  entry,
  isMe,
  youLabel,
  boardId,
  currentUserId,
}: {
  entry: BoardSummaryEntry;
  isMe: boolean;
  youLabel: string;
  boardId: number;
  currentUserId: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <MemberNameLink
        boardId={boardId}
        userId={entry.member.user_id}
        currentUserId={currentUserId}
        name={displayName(entry.member.username, entry.member.first_name, entry.member.last_name)}
        username={entry.member.username}
        className="font-medium"
      />
      {isMe ? <span className="shrink-0 rounded-md bg-page-accent p-1 text-2xs font-medium uppercase tracking-wide text-white">{youLabel}</span> : null}
    </span>
  );
}
