"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  shown: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  isFetching: boolean;
};

export function LeaderboardPagination({ page, totalPages, shown, total, onPrev, onNext, isFetching }: Props) {
  const t = useTranslations("competitions.leaderboard.pagination");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-2xs text-muted-foreground tabular-nums sm:text-left">{t("showing", { shown, total })}</p>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 1 || isFetching} className="gap-1">
          <ChevronLeft className="size-3.5" aria-hidden />
          {t("prev")}
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">{t("page", { page, total: totalPages })}</span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages || isFetching} className="gap-1">
          {t("next")}
          <ChevronRight className="size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
