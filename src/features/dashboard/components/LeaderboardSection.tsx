"use client";

import { ArrowRight, Target, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { getInitials } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import type { CompetitionLeaderboard, DashboardLeaderboard } from "../types/dashboard.types";

import { CardReveal } from "./CardReveal";

type Props = {
  leaderboard: DashboardLeaderboard | null;
  currentUserId: string | null;
};

// Match the accent treatment used in PreferenceControls' segmented control so
// the active tab tile lifts visibly and tints with the route accent. The base
// `Tabs` component already sets `data-active:bg-card` — we add the strong
// accent text, soft drop shadow, and a hair of accent ring on top.
const accentTab = "data-active:text-page-accent-strong data-active:shadow-sm data-active:ring-1 data-active:ring-page-accent/20";

export function LeaderboardSection({ leaderboard, currentUserId }: Props) {
  const t = useTranslations("dashboard.leaderboard");

  return (
    <CardReveal className="flex h-full flex-col bg-card p-4 opacity-0 sm:p-5">
      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold">{t("title")}</span>
        <span className="text-xs text-muted-foreground">{t("subtitle")}</span>
      </div>

      <Tabs defaultValue="pickem" className="mt-4 flex flex-1 flex-col gap-3">
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
        <TabsContent value="pickem">
          <LeaderboardEntries data={leaderboard?.pickem ?? null} currentUserId={currentUserId} />
        </TabsContent>
        <TabsContent value="match">
          <LeaderboardEntries data={leaderboard?.match ?? null} currentUserId={currentUserId} />
        </TabsContent>
      </Tabs>

      {/* TODO: Update the redirection once the boards page is ready */}
      <div className="mt-auto flex items-center justify-end pt-3">
        <Link
          href="/boards/global"
          className="flex items-center gap-1 text-xs font-medium text-page-accent-strong transition-colors hover:text-page-accent hover:underline"
        >
          {t("fullRanking")}
          <ArrowRight className="size-3" />
        </Link>
      </div>
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

  // Cap to top 5 — keeps the section short on the dashboard.
  const entries = data.entries.slice(0, 5);

  return (
    <div className="flex flex-col">
      {/* Three-column header: rank / player / points. Same grid template as
          the rows below so columns line up cleanly. Rank column is fixed at
          `w-9` in both header and rows so column-2 edges align. The PLAYER
          label gets a `pl-9.5` inset (avatar size-7 + gap-2.5 = 38px) so it
          sits over the username, not the avatar. */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border px-2 pb-2 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        <span className="w-9">{t("rank")}</span>
        <span className="pl-9.5">{t("player")}</span>
        <span>{t("points")}</span>
      </div>
      <ul className="divide-y divide-border">
        {entries.map((entry) => {
          const isMe = entry.member.user_id === currentUserId;
          return (
            <li key={entry.member.user_id} className={cn("grid grid-cols-[auto_1fr_auto] items-center gap-3 px-2 py-2.5", isMe && "bg-page-accent-soft/60")}>
              <span className="w-9 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">{entry.rank}</span>
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarFallback className="text-2xs">{getInitials(entry.member.username)}</AvatarFallback>
                </Avatar>
                <span className={cn("min-w-0 truncate text-sm", isMe && "font-semibold text-page-accent-strong")}>{isMe ? t("you") : entry.member.username}</span>
              </div>
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
