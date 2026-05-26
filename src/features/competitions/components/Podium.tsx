"use client";

import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Card, CardContent } from "@/shared/components/ui/card";
import { getInitials } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import type { LeaderboardEntry } from "../types/competitions.types";

type Props = {
  entries: LeaderboardEntry[];
};

const ORDER = [1, 0, 2] as const;

export function Podium({ entries }: Props) {
  const t = useTranslations("competitions.podium");
  const top = entries.slice(0, 3);

  if (top.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-5 text-sm text-muted-foreground">{t("empty")}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden py-5">
      <span className="pointer-events-none absolute top-3 left-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("title")}</span>
      <CardContent className="mx-auto grid w-full max-w-md grid-cols-3 items-end gap-2 px-3 pt-8 pb-0">
        {ORDER.map((index) => {
          const entry = top[index];
          if (!entry) return <span key={index} aria-hidden />;
          return <PodiumStep key={entry.member.user_id} entry={entry} />;
        })}
      </CardContent>
    </Card>
  );
}

type MedalTone = "gold" | "silver" | "bronze";

const TONE_BY_RANK: Record<1 | 2 | 3, MedalTone> = { 1: "gold", 2: "silver", 3: "bronze" };
const PEDESTAL_HEIGHT: Record<1 | 2 | 3, string> = { 1: "h-20", 2: "h-14", 3: "h-11" };

const TONE_PEDESTAL: Record<MedalTone, string> = {
  gold: "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-300/60 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30",
  silver: "bg-zinc-200 text-zinc-700 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-700/50 dark:text-zinc-300 dark:ring-zinc-500/40",
  bronze: "bg-amber-700/15 text-amber-800 ring-1 ring-inset ring-amber-700/25 dark:bg-amber-700/25 dark:text-orange-400 dark:ring-amber-600/30",
};

const TONE_RING: Record<MedalTone, string> = {
  gold: "ring-gold",
  silver: "ring-silver",
  bronze: "ring-bronze",
};

const TONE_AVATAR_FILL: Record<MedalTone, string> = {
  gold: "bg-amber-100 dark:bg-amber-500/15",
  silver: "bg-zinc-200 dark:bg-zinc-700/50",
  bronze: "bg-amber-700/15 dark:bg-amber-700/25",
};

function PodiumStep({ entry }: { entry: LeaderboardEntry }) {
  const t = useTranslations("competitions.podium");
  const rank = (entry.rank === 1 || entry.rank === 2 ? entry.rank : 3) as 1 | 2 | 3;
  const tone = TONE_BY_RANK[rank];
  const isFirst = rank === 1;
  const displayName = [entry.member.first_name, entry.member.last_name].filter(Boolean).join(" ") || entry.member.username;

  return (
    <div className="flex w-full flex-col items-center gap-1.5">
      <div className="relative">
        {isFirst ? <Crown className="absolute -top-5 left-1/2 size-4 -translate-x-1/2 fill-gold text-gold" aria-hidden /> : null}
        <Avatar className={cn("ring-2", isFirst ? "size-14" : "size-12", TONE_RING[tone])}>
          <AvatarFallback className={cn("text-xs font-semibold", TONE_AVATAR_FILL[tone])}>
            {getInitials(entry.member.username, entry.member.first_name ?? undefined, entry.member.last_name ?? undefined)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex w-full flex-col items-center leading-tight">
        <span className="max-w-full truncate text-2xs font-semibold sm:text-xs" title={displayName}>
          {displayName}
        </span>
        <span className="text-2xs text-muted-foreground tabular-nums">{t("points", { points: entry.score.total.toLocaleString() })}</span>
      </div>

      <div className={cn("flex w-full items-center justify-center rounded-t-md font-mono text-base font-bold tabular-nums", PEDESTAL_HEIGHT[rank], TONE_PEDESTAL[tone])}>
        {rank}
      </div>
    </div>
  );
}
