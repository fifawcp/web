"use client";

import { useState } from "react";
import { ArrowRight, Crown, Target, Trophy, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

import type { CompetitionLeaderboard, DashboardLeaderboard } from "../types/dashboard.types";

import { CardReveal } from "./CardReveal";

type Props = {
  leaderboard: DashboardLeaderboard | null;
  currentUserId: string | null;
  delay?: number;
  from?: "up" | "left" | "right";
};

const accentTab =
  "data-active:text-page-accent-strong data-active:shadow-sm data-active:ring-1 data-active:ring-page-accent/20 dark:data-active:border-transparent dark:data-active:bg-card dark:data-active:text-page-accent-strong";

type LeaderboardTab = "pickem" | "match";

export function LeaderboardCard({ leaderboard, currentUserId, delay, from }: Props) {
  const t = useTranslations("dashboard.leaderboard");
  // Controlled so the "Full ranking" link can follow the active tab to that
  // competition on the global board.
  const [tab, setTab] = useState<LeaderboardTab>("pickem");

  const activeCompetition = tab === "pickem" ? leaderboard?.pickem : leaderboard?.match;
  const fullRankingHref = activeCompetition ? `/boards/${activeCompetition.board_id}?competition=${activeCompetition.competition_id}` : "/boards?board=global";

  return (
    <CardReveal delay={delay} from={from} className="opacity-0 flex h-full flex-1 flex-col bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold">{t("title")}</span>
        <span className="text-xs text-muted-foreground">{t("subtitle")}</span>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as LeaderboardTab)} className="mt-4 flex flex-1 flex-col gap-3">
        <TabsList className="w-full">
          <TabsTrigger value="pickem" className={accentTab}>
            <Trophy className="size-3.5" />
            {t("tabs.pickem")}
          </TabsTrigger>
          <TabsTrigger value="match" className={accentTab}>
            <Target className="size-3.5" />
            {t("tabs.match")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pickem" className="flex-1">
          <LeaderboardEntries data={leaderboard?.pickem ?? null} currentUserId={currentUserId} />
        </TabsContent>
        <TabsContent value="match" className="flex-1">
          <LeaderboardEntries data={leaderboard?.match ?? null} currentUserId={currentUserId} />
        </TabsContent>
      </Tabs>

      <Button asChild variant="outline" className="group/full w-full text-page-accent-strong">
        <Link href={fullRankingHref}>
          {t("fullRanking")}
          <ArrowRight className="size-4 transition-transform group-hover/full:translate-x-0.5" aria-hidden />
        </Link>
      </Button>
    </CardReveal>
  );
}

function LeaderboardEntries({ data, currentUserId }: { data: CompetitionLeaderboard | null; currentUserId: string | null }) {
  const t = useTranslations("dashboard.leaderboard");
  const isEmpty = !data || data.entries.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Users className="size-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium">{t("empty.title")}</span>
        <span className="text-xs text-muted-foreground">{t("empty.description")}</span>
      </div>
    );
  }

  // Backend returns the top 10; show them all so the rail fills and its bottom aligns with the main column.
  const entries = data.entries.slice(0, 10);

  return (
    <div className="flex flex-1 flex-col">
      {/* Three-column rows: rank / player / points. Rank column is fixed at `w-9`
          in both header and rows so column-2 edges align. The list grows and rows
          stretch so the card fills the rail. */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border px-2 pb-2 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        <span className="w-12 whitespace-nowrap">{t("rank")}</span>
        <span>{t("player")}</span>
        <span>{t("points")}</span>
      </div>
      <ul className="flex flex-1 flex-col divide-y divide-border">
        {entries.map((entry) => {
          const isMe = entry.member.user_id === currentUserId;
          return (
            <li key={entry.member.user_id} className={cn("grid flex-1 grid-cols-[auto_1fr_auto] items-center gap-3 px-2 py-2.5", isMe && "bg-page-accent-soft/60")}>
              <span className="flex w-12 shrink-0 items-center text-xs font-medium tabular-nums text-muted-foreground">
                {entry.rank === 1 ? <Crown className="size-3.5 text-page-accent-strong" aria-label="1" /> : entry.rank}
              </span>
              <span className={cn("min-w-0 truncate text-sm", isMe && "font-semibold text-page-accent-strong")}>{isMe ? t("you") : entry.member.username}</span>
              <span className="shrink-0 text-xs font-medium tabular-nums">
                {entry.points} <span className="font-normal text-muted-foreground">{t("pts")}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
