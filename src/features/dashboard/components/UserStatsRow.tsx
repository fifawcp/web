"use client";

import { useLocale, useTranslations } from "next-intl";

import { formatShortDate } from "@/shared/lib/dates";

import type { UserDashboardStats } from "../types/dashboard.types";

type Props = {
  stats: UserDashboardStats;
};

type StatBlockProps = {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  img?: string;
};

function StatBlock({ label, value, subtext, img }: StatBlockProps) {
  return (
    <div className="flex items-center gap-3 p-2 md:px-4 md:py-3 lg:flex-1 min-w-32 lg:min-w-46  border-b border-border md:border-b-0">
      {img && (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
          <img src={img} alt={label} className="size-6 object-contain" />
        </div>
      )}
      <div className="flex flex-col gap-1 p-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-heading text-lg md:text-2xl font-bold leading-none">{value}</span>
        {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
      </div>
    </div>
  );
}

export function UserStatsRow({ stats }: Props) {
  const t = useTranslations("dashboard.auth.stats");
  const locale = useLocale();

  const bracketPercent = stats.bracketTotal > 0 ? Math.round((stats.bracketComplete / stats.bracketTotal) * 100) : 0;

  return (
    <div className="flex flex-col md:flex-row items-stretch md:divide-x divide-border border-t border-border pt-2">
      {/*Predicted Champion*/}
      <StatBlock label={t("predictedChampion")} value={stats.predictedChampion?.teamName} img={stats.predictedChampion?.flagUrl} />

      {/* Your Rank */}
      <StatBlock label={t("yourRank")} value={`#${stats.rank}`} subtext={t("ofMembers", { count: stats.totalMembers })} />

      {/* Bracket Complete */}
      <StatBlock label={t("bracketComplete")} value={`${bracketPercent}%`} subtext={t("slots", { filled: stats.bracketComplete, total: stats.bracketTotal })} />

      {/* Next Round */}
      {stats.nextRound && (
        <StatBlock label={t("nextRound")} value={formatShortDate(new Date(stats.nextRound.startsAt), locale)} subtext={t(`rounds.${stats.nextRound.name}`)} />
      )}
    </div>
  );
}
