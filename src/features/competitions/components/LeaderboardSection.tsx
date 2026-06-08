"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { LEADERBOARD_PAGE_SIZE } from "../api/competitions";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { buildColumns, buildMobileCyclableColumns } from "../lib/competitionColumns";
import type { Competition, LeaderboardPage } from "../types/competitions.types";

import { LeaderboardMobileTable } from "./LeaderboardMobileTable";
import { LeaderboardPagination } from "./LeaderboardPagination";
import { LeaderboardTable } from "./LeaderboardTable";

type Props = {
  boardId: number;
  competition: Competition;
  currentUserId: string;
  initialData: LeaderboardPage | null;
};

const PAGE_PARAM = "page";
const Q_PARAM = "q";
const SORT_PARAM = "sort";
const DIR_PARAM = "dir";

export function LeaderboardSection({ boardId, competition, currentUserId, initialData }: Props) {
  const t = useTranslations("competitions.leaderboard");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get(PAGE_PARAM) ?? "1") || 1);
  const query_ = searchParams.get(Q_PARAM)?.trim() ?? "";
  const sort = searchParams.get(SORT_PARAM) ?? "total";
  const dir = searchParams.get(DIR_PARAM) === "asc" ? "asc" : "desc";

  const tCols = useTranslations("competitions.leaderboard.columns");

  const columns = useMemo(() => buildColumns(competition.type), [competition.type]);
  // Short labels: the cycler shows one metric in a fixed-width column, so they must stay compact.
  const mobileColumns = useMemo(
    () => buildMobileCyclableColumns(competition.type).map((col) => ({ id: col.id, label: tCols(col.labelKey), value: col.value, display: col.display })),
    [competition.type, tCols]
  );

  const query = useLeaderboard({
    boardId,
    competitionId: competition.id,
    page,
    q: query_,
    sort,
    dir,
    initialData: initialData ?? undefined,
  });

  const data = query.data;
  const items = data?.items ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LEADERBOARD_PAGE_SIZE));
  const isLoading = query.isFetching && items.length === 0;
  const emptyLabel = query_.length > 0 ? t("noResults") : t("empty");

  function changePage(next: number) {
    const params = new URLSearchParams(searchParams);
    const clamped = Math.min(totalPages, Math.max(1, next));
    if (clamped === 1) params.delete(PAGE_PARAM);
    else params.set(PAGE_PARAM, String(clamped));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Click a new column → sort it descending; click the active column → flip direction.
  function onSort(key: string) {
    const params = new URLSearchParams(searchParams);
    const nextDir = key === sort && dir === "desc" ? "asc" : "desc";
    if (key === "total") params.delete(SORT_PARAM);
    else params.set(SORT_PARAM, key);
    if (nextDir === "desc") params.delete(DIR_PARAM);
    else params.set(DIR_PARAM, "asc");
    params.delete(PAGE_PARAM);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-xs">
      <div className="hidden md:block">
        <LeaderboardTable
          columns={columns}
          rows={items}
          currentUserId={currentUserId}
          isLoading={isLoading}
          emptyLabel={emptyLabel}
          sort={sort}
          dir={dir}
          onSort={onSort}
        />
      </div>
      <div className="p-4 md:hidden">
        <LeaderboardMobileTable
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
            onPrev={() => changePage(page - 1)}
            onNext={() => changePage(page + 1)}
            isFetching={query.isFetching}
          />
        </div>
      ) : null}
    </div>
  );
}
