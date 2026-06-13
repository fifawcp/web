"use client";

import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Match } from "@/features/schedule/types/schedule.types";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { useBoardMatchPicks } from "../../hooks/useBoardMatchPicks";
import { computeMatchBreakdown } from "../../lib/computeMatchBreakdown";

import { BreakdownStatsCard } from "./BreakdownStatsCard";
import { InlineMatchTeams } from "./InlineMatchTeams";

type Props = {
  boardId: number;
  competitionId: number;
  match: Match;
  // Only fetch when the preview is actually visible (desktop) — avoids a wasted
  // request behind the `hidden lg:block` pane on mobile.
  enabled: boolean;
};

// Desktop-only live preview of how the board predicted the hovered/focused match:
// the outcome distribution + recap, with a link to the full breakdown route.
export function MatchRevealPreview({ boardId, competitionId, match, enabled }: Props) {
  const t = useTranslations("competitions.breakdown");
  const { data, isError } = useBoardMatchPicks(boardId, match.id, undefined, { enabled });

  // Only trust data for the current match (react-query returns the new key's cache,
  // undefined while a fresh match loads).
  const breakdown = useMemo(() => (data && data.match.id === match.id ? computeMatchBreakdown(data.picks, data.match.result) : null), [data, match.id]);

  const result = match.result;
  const score = result ? (
    <span className="font-heading text-sm font-bold tabular-nums">
      {result.home_score}
      <span className="px-1 font-normal text-muted-foreground">&minus;</span>
      {result.away_score}
    </span>
  ) : (
    <span className="text-2xs font-semibold tracking-wide text-muted-foreground uppercase">{t("vs")}</span>
  );

  return (
    <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <InlineMatchTeams match={match} score={score} />
        <Link
          href={`/boards/${boardId}/competitions/${competitionId}/matches/${match.id}`}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-page-accent-strong transition-colors hover:text-page-accent"
        >
          {t("boardPredictions.viewFull")}
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      {/* Center the stats in the leftover height so the panel matches the list column without
          a top-crammed look. */}
      <div className="flex flex-1 flex-col justify-center">
        {isError ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("boardPredictions.previewError")}</p>
        ) : breakdown ? (
          <BreakdownStatsCard breakdown={breakdown} match={data!.match} bare showRecap={false} />
        ) : (
          <PreviewSkeleton />
        )}
      </div>
    </div>
  );
}

// Mirrors the loaded `BreakdownStatsCard` (bare, no recap) 1:1 — same gaps and element
// heights — so swapping skeleton ↔ content never changes the preview height (no card jump).
function PreviewSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="flex items-center justify-between gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </div>
      </div>
    </div>
  );
}
