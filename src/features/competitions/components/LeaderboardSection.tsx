"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";

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
  const urlQuery = searchParams.get(Q_PARAM) ?? "";
  const [inputValue, setInputValue] = useState(urlQuery);
  const debouncedQuery = useDebounce(inputValue.trim(), 300);

  useEffect(() => {
    if (debouncedQuery === urlQuery) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedQuery) next.set(Q_PARAM, debouncedQuery);
    else next.delete(Q_PARAM);
    next.delete(PAGE_PARAM);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedQuery, urlQuery, searchParams, router, pathname]);

  const columns = useMemo(() => buildColumns(competition.type), [competition.type]);
  const cyclableColumns = useMemo(() => buildMobileCyclableColumns(competition.type), [competition.type]);

  const query = useLeaderboard({
    boardId,
    competitionId: competition.id,
    page,
    q: debouncedQuery,
    initialData: initialData ?? undefined,
  });

  const data = query.data;
  const items = data?.items ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LEADERBOARD_PAGE_SIZE));
  const isLoading = query.isFetching && items.length === 0;
  const hasQuery = debouncedQuery.length > 0;
  const emptyLabel = hasQuery ? t("noResults") : t("empty");

  function changePage(next: number) {
    const params = new URLSearchParams(searchParams);
    const clamped = Math.min(totalPages, Math.max(1, next));
    if (clamped === 1) params.delete(PAGE_PARAM);
    else params.set(PAGE_PARAM, String(clamped));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="flex flex-1 items-baseline gap-3">
            <h3 className="font-heading text-base font-semibold">{t("title")}</h3>
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">{t("memberCount", { count: totalCount })}</span>
          </div>

          <div className="relative md:w-64 lg:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={t("search")}
              className="pl-9"
              aria-label={t("search")}
            />
            {inputValue ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setInputValue("")}
                className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
                aria-label={t("search")}
              >
                <X className="size-3.5" aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="hidden md:block">
          <LeaderboardTable columns={columns} rows={items} currentUserId={currentUserId} isLoading={isLoading} emptyLabel={emptyLabel} />
        </div>
        <div className="md:hidden">
          <LeaderboardMobileTable rows={items} cyclableColumns={cyclableColumns} currentUserId={currentUserId} isLoading={isLoading} emptyLabel={emptyLabel} />
        </div>

        {totalPages > 1 ? (
          <LeaderboardPagination
            page={page}
            totalPages={totalPages}
            shown={items.length}
            total={totalCount}
            onPrev={() => changePage(page - 1)}
            onNext={() => changePage(page + 1)}
            isFetching={query.isFetching}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
