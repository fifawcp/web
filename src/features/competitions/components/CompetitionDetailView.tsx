"use client";

import { useMemo } from "react";
import { ChevronLeft, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AwardType } from "@/features/awards/types/awards.types";
import type { Board } from "@/features/boards/types/boards.types";
import type { PickemProgress } from "@/features/pickems/types/pickems.types";
import { useNow } from "@/features/schedule/hooks/useNow";
import type { Match } from "@/features/schedule/types/schedule.types";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/shared/components/Reveal";

import { revealableMatches } from "../lib/matchesInScope";
import type { Competition, LeaderboardPage } from "../types/competitions.types";
import type { BoardMatchPicks } from "../types/predictions.types";

import { MatchBreakdownView } from "./breakdown/MatchBreakdownView";
import { CompetitionDetailHeader } from "./CompetitionDetailHeader";
import { LeaderboardSearch } from "./LeaderboardSearch";
import { LeaderboardSection } from "./LeaderboardSection";
import { MatchRevealList } from "./MatchRevealList";

type Props = {
  currentUserId: string;
  board: Board;
  competition: Competition;
  matches: Match[];
  pickem: { progress: PickemProgress | null; isLocked: boolean } | null;
  awards: { pickedTypes: AwardType[]; isLocked: boolean } | null;
  initialLeaderboard: LeaderboardPage | null;
  // Server-seeded board picks for a `pick` competition's match, once it has locked.
  breakdownInitial: BoardMatchPicks | null;
};

export function CompetitionDetailView({ currentUserId, board, competition, matches, pickem, awards, initialLeaderboard, breakdownInitial }: Props) {
  const t = useTranslations("competitions");
  const now = useNow();
  const playersCount = initialLeaderboard?.total ?? 0;

  const isPick = competition.type === "pick";

  // Custom competitions expose a "how the board predicted" list of their locked matches.
  const revealable = useMemo(() => (competition.type === "match" ? revealableMatches(competition, matches, now) : []), [competition, matches, now]);
  const revealAvailable = revealable.length > 0;

  // A pick whose match has locked: the breakdown carries the leaderboard, so the
  // ranked table below is dropped to avoid duplicate member lists.
  const pickBreakdown = isPick && breakdownInitial ? breakdownInitial : null;

  return (
    <section className="container flex flex-col gap-5 pt-6 pb-8 lg:pt-8">
      <Link
        href={`/boards/${board.id}?tab=competitions`}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t("detail.back")}
      </Link>

      <Reveal from="up" trigger="mount">
        <CompetitionDetailHeader competition={competition} matches={matches} pickem={pickem} awards={awards} />
      </Reveal>

      {pickBreakdown ? (
        // The breakdown owns its own directional reveals, so it renders unwrapped.
        <MatchBreakdownView boardId={board.id} matchId={pickBreakdown.match.id} currentUserId={currentUserId} initialData={pickBreakdown} showRank />
      ) : isPick ? (
        // A single-match pick whose match hasn't kicked off — the leaderboard would be
        // all zeros, so show a friendly "results unlock at kickoff" state instead.
        <Reveal
          from="up"
          trigger="mount"
          delay={0.06}
          className="flex flex-col items-center gap-3 rounded-xl border border-foreground/10 bg-card px-6 py-12 text-center shadow-xs"
        >
          <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <Lock className="size-5" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-heading text-base font-semibold">{t("breakdown.locked.title")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t("breakdown.locked.description")}</p>
          </div>
        </Reveal>
      ) : (
        <>
          {revealAvailable ? (
            <Reveal from="up" trigger="mount" delay={0.06}>
              <MatchRevealList boardId={board.id} competitionId={competition.id} matches={revealable} />
            </Reveal>
          ) : null}

          <Reveal from="up" trigger="mount" delay={0.1} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">{t("leaderboard.memberCount", { count: playersCount })}</span>
            <LeaderboardSearch className="sm:w-72" />
          </Reveal>

          <Reveal from="up" trigger="mount" delay={0.14}>
            <LeaderboardSection
              boardId={board.id}
              competition={competition}
              currentUserId={currentUserId}
              initialData={initialLeaderboard}
              revealAvailable={revealAvailable}
            />
          </Reveal>
        </>
      )}
    </section>
  );
}
