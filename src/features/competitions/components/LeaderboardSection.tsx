"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useRouter as useIntlRouter } from "@/i18n/navigation";

import { LEADERBOARD_PAGE_SIZE } from "../api/competitions";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { buildColumns, buildMobileCyclableColumns } from "../lib/competitionColumns";
import { memberPickemPath } from "../lib/memberPickemUrl";
import type { Competition, LeaderboardEntry, LeaderboardPage } from "../types/competitions.types";

import { LeaderboardMobileTable } from "./LeaderboardMobileTable";
import { LeaderboardPagination } from "./LeaderboardPagination";
import { LeaderboardTable } from "./LeaderboardTable";
import { MemberPicksDialog } from "./MemberPicksDialog";

type Props = {
  boardId: number;
  competition: Competition;
  currentUserId: string;
  initialData: LeaderboardPage | null;
  // Enables the per-row eye action that reveals a member's predictions:
  //   "dialog"   — match competitions: open the per-match picks dialog in place.
  //   "navigate" — pick'em competitions: go to the member's full pick'em page.
  revealMode?: "dialog" | "navigate";
};

const PAGE_PARAM = "page";
const Q_PARAM = "q";
const SORT_PARAM = "sort";
const DIR_PARAM = "dir";

export function LeaderboardSection({ boardId, competition, currentUserId, initialData, revealMode }: Props) {
  const t = useTranslations("competitions.leaderboard");
  const router = useRouter();
  const intlRouter = useIntlRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);
  const onViewMember = revealMode
    ? (entry: LeaderboardEntry) => {
        if (revealMode === "navigate") {
          intlRouter.push(memberPickemPath(boardId, competition.id, entry.member));
          return;
        }
        setSelected(entry);
        setOpen(true);
      }
    : undefined;

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
          onViewMember={onViewMember}
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
          onViewMember={onViewMember}
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

      {revealMode === "dialog" ? (
        <MemberPicksDialog
          open={open}
          onOpenChange={setOpen}
          boardId={boardId}
          competitionId={competition.id}
          member={selected?.member ?? null}
          rank={selected?.rank ?? 0}
          points={selected?.score.total ?? 0}
        />
      ) : null}
    </div>
  );
}
