"use client";

import { Crown, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { displayName, getInitials } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import type { CompetitionViewer, LeaderboardEntry } from "../types/competitions.types";

type Props = {
  entries: LeaderboardEntry[];
  currentUserId: string;
  currentUserInitials: string;
  viewer: CompetitionViewer;
};

export function CompetitionMiniLeaderboard({ entries, currentUserId, currentUserInitials, viewer }: Props) {
  const t = useTranslations("competitions");
  const top = entries.slice(0, 3);
  const youInTop = top.some((entry) => entry.member.user_id === currentUserId);
  const showYouRow = !youInTop && viewer.rank > 3;

  if (top.length === 0) {
    return <p className="flex min-h-36 items-center justify-center rounded-lg bg-muted px-3 text-center text-xs text-muted-foreground">{t("podium.empty")}</p>;
  }

  return (
    <div className="flex min-h-36 flex-col gap-px rounded-lg bg-muted p-1.5">
      {top.map((entry) => (
        <MiniRow
          key={entry.member.user_id}
          rank={entry.rank}
          name={displayName(entry.member.username, entry.member.first_name, entry.member.last_name)}
          initials={getInitials(entry.member.username, entry.member.first_name ?? undefined, entry.member.last_name ?? undefined)}
          points={entry.score.total}
          isYou={entry.member.user_id === currentUserId}
        />
      ))}
      {showYouRow ? <MiniRow rank={viewer.rank} name={t("leaderboard.you")} initials={currentUserInitials} points={viewer.total_points} isYou separated /> : null}
    </div>
  );
}

function MiniRow({
  rank,
  name,
  initials,
  points,
  isYou,
  separated,
}: {
  rank: number;
  name: string;
  initials: string;
  points: number;
  isYou: boolean;
  separated?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-md px-1.5 py-1 text-sm", isYou && "bg-page-accent-soft", separated && "mt-0.5")}>
      <span
        className={cn(
          "inline-flex w-4 shrink-0 justify-center font-mono text-xs font-semibold tabular-nums",
          rank === 1 ? "text-page-accent-strong" : "text-muted-foreground"
        )}
      >
        {rank === 1 ? <Crown className="size-3.5" aria-hidden /> : rank}
      </span>
      <Avatar className="size-6 border border-border">
        <AvatarFallback className="bg-card text-2xs font-semibold text-foreground">
          {initials || <User className="size-3 text-muted-foreground" aria-hidden />}
        </AvatarFallback>
      </Avatar>
      <span className={cn("min-w-0 flex-1 truncate", isYou ? "font-semibold" : "font-medium")}>{name}</span>
      <span className="shrink-0 font-mono text-xs font-semibold tabular-nums">{points.toLocaleString()}</span>
    </div>
  );
}
