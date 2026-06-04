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

export function LeaderboardSection({ boardId, competition, currentUserId, initialData }: Props) {
  const t = useTranslations("competitions.leaderboard");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get(PAGE_PARAM) ?? "1") || 1);
  const query_ = searchParams.get(Q_PARAM)?.trim() ?? "";

  const columns = useMemo(() => buildColumns(competition.type), [competition.type]);
  const cyclableColumns = useMemo(() => buildMobileCyclableColumns(competition.type), [competition.type]);

  const query = useLeaderboard({
    boardId,
    competitionId: competition.id,
    page,
    q: query_,
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

  return (
    <div className="overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-xs">
      <div className="hidden md:block">
        <LeaderboardTable columns={columns} rows={items} currentUserId={currentUserId} isLoading={isLoading} emptyLabel={emptyLabel} />
      </div>
      <div className="p-4 md:hidden">
        <LeaderboardMobileTable rows={items} cyclableColumns={cyclableColumns} currentUserId={currentUserId} isLoading={isLoading} emptyLabel={emptyLabel} />
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
