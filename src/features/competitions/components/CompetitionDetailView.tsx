"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Board } from "@/features/boards/types/boards.types";
import type { PickemProgress } from "@/features/pickems/types/pickems.types";
import type { Match } from "@/features/schedule/types/schedule.types";
import { Link } from "@/i18n/navigation";

import type { Competition, LeaderboardPage } from "../types/competitions.types";

import { CompetitionDetailHeader } from "./CompetitionDetailHeader";
import { LeaderboardSearch } from "./LeaderboardSearch";
import { LeaderboardSection } from "./LeaderboardSection";

type Props = {
  currentUserId: string;
  board: Board;
  competition: Competition;
  matches: Match[];
  pickem: { progress: PickemProgress | null; isLocked: boolean } | null;
  initialLeaderboard: LeaderboardPage | null;
};

export function CompetitionDetailView({ currentUserId, board, competition, matches, pickem, initialLeaderboard }: Props) {
  const t = useTranslations("competitions");
  const playersCount = initialLeaderboard?.total ?? 0;

  return (
    <section className="container flex flex-col gap-5 pt-6 pb-8 lg:pt-8">
      <Link
        href={`/boards/${board.id}?tab=competitions`}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t("detail.back")}
      </Link>

      <CompetitionDetailHeader competition={competition} matches={matches} pickem={pickem} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">{t("leaderboard.memberCount", { count: playersCount })}</span>
        <LeaderboardSearch className="sm:w-72" />
      </div>

      <LeaderboardSection boardId={board.id} competition={competition} currentUserId={currentUserId} initialData={initialLeaderboard} />
    </section>
  );
}
