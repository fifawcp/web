"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Card } from "@/shared/components/ui/card";
import { getRankColor } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import { leaderboardCardAnimation } from "../animations/card.animations";
import type { CompetitionLeaderboard } from "../types/dashboard.types";

type Props = {
  pickem: CompetitionLeaderboard | null;
  match: CompetitionLeaderboard | null;
  currentUserId: string | null;
};

type ColumnProps = {
  data: CompetitionLeaderboard | null;
  currentUserId: string | null;
  title: string;
  href: string;
  fullRankingLabel: string;
  youLabel: string;
  ptsLabel: string;
  emptyTitle: string;
  emptyDescription: string;
};

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

function LeaderboardColumn({ data, currentUserId, title, href, fullRankingLabel, youLabel, ptsLabel, emptyTitle, emptyDescription }: ColumnProps) {
  const isEmpty = !data || data.entries.length === 0;

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-sm font-medium">{title}</span>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted mb-2">
            <Users className="size-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium">{emptyTitle}</span>
          <span className="text-xs text-muted-foreground mt-1">{emptyDescription}</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {data.entries.map((entry) => {
              const isMe = entry.member.user_id === currentUserId;
              return (
                <div key={entry.member.user_id} className={cn("flex items-center gap-2.5 px-4 py-2.5 border-b border-border", isMe && "bg-lime-50 dark:bg-lime-950/20")}>
                  <span className={`w-4 text-xs tabular-nums font-medium shrink-0 ${getRankColor(entry.rank, "text")}`}>{entry.rank}</span>
                  <div
                    className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold bg-muted", getRankColor(entry.rank, "text"))}
                  >
                    {getInitials(entry.member.username)}
                  </div>
                  <span className={cn("flex-1 text-sm truncate", isMe && "font-medium")}>{isMe ? youLabel : entry.member.username}</span>
                  <span className="text-xs font-medium tabular-nums shrink-0">
                    {entry.points} <span className="text-muted-foreground font-normal">{ptsLabel}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end px-4 py-3 mt-auto">
            <Link href={href} className="flex items-center gap-1 text-xs font-medium hover:underline">
              {fullRankingLabel}
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export function CombinedLeaderboardCard({ pickem, match, currentUserId }: Props) {
  const t = useTranslations("dashboard.leaderboard");
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) {
      return;
    }

    return leaderboardCardAnimation({
      card: cardRef.current,
    });
  }, []);

  const columnProps = {
    currentUserId,
    fullRankingLabel: t("fullRanking"),
    youLabel: t("you"),
    ptsLabel: t("pts"),
    emptyTitle: t("empty.title"),
    emptyDescription: t("empty.description"),
  };

  return (
    <Card ref={cardRef} size="sm" className="bg-card h-full opacity-0">
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border flex-1">
        <LeaderboardColumn {...columnProps} data={pickem} title={t("pickemTitle")} href="/boards/global?tab=pickem" />
        <LeaderboardColumn {...columnProps} data={match} title={t("matchTitle")} href="/boards/global?tab=match" />
      </div>
    </Card>
  );
}
