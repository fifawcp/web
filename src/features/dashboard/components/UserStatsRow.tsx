"use client";

import React from "react";
import { CalendarDays, GitBranch, Target, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { formatShortDate } from "@/shared/lib/dates";

import type { DashboardStats } from "../types/dashboard.types";

type Props = {
  stats: DashboardStats;
};

type StatItemProps = {
  label: string;
  icon?: LucideIcon;
  iconContent?: React.ReactNode;
  value: React.ReactNode;
};

function StatItem({ label, icon, iconContent, value }: StatItemProps) {
  return (
    <div className="flex items-center sm:flex-col xl:flex-row sm:justify-center xl:justify-start gap-3 flex-1 px-2 sm:px-3 py-2 md:py-3 min-w-0 border-b sm:border-b-0 border-foreground/30 dark:border-border">
      {
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          {iconContent || (icon && React.createElement(icon, { className: "size-7 text-muted-foreground" }))}
        </div>
      }
      <div className="flex flex-col sm:text-center xl:text-start min-w-0 flex-1 gap-1">
        <span className="text-xs sm:text-[11px] xl:text-xs h-5 sm:h-7 xl:h-auto flex items-center uppercase tracking-wider text-muted-foreground leading-none">
          {label}
        </span>
        {value}
      </div>
    </div>
  );
}

function CompetitionStat({ label, rank, points, icon }: { label: string; rank: number; points: number; icon: LucideIcon }) {
  return (
    <StatItem
      label={label}
      icon={icon}
      value={
        <div className="flex sm:justify-center xl:justify-start items-baseline gap-1.5 md:gap-2">
          <span className="font-heading text-sm md:text-base xl:text-lg font-bold leading-tight">{points} pts</span>
          <span className="font-heading text-sm md:text-base xl:text-lg font-bold leading-tight">(#{rank})</span>
        </div>
      }
    />
  );
}

export function UserStatsRow({ stats }: Props) {
  const t = useTranslations("dashboard.stats");
  const locale = useLocale();

  const championName = stats.picked_champion?.name[locale] ?? stats.picked_champion?.name["en"] ?? "—";

  const nextMatch = stats.next_match;
  const kickoffDate = nextMatch ? formatShortDate(new Date(nextMatch.kickoff_at), locale) : null;
  const homeFifaCode = nextMatch?.home_team?.fifa_code ?? "";
  const awayFifaCode = nextMatch?.away_team?.fifa_code ?? "";

  return (
    <>
      {/* 1 — Predicted champion */}
      <StatItem
        label={t("predictedChampion")}
        icon={Trophy}
        iconContent={
          stats.picked_champion?.flag_url && <img src={stats.picked_champion.flag_url} alt={stats.picked_champion.fifa_code} className="size-7 object-contain" />
        }
        value={<span className="font-heading text-sm md:text-base xl:text-lg font-bold leading-tight truncate">{championName}</span>}
      />

      {/* 2 — Pick'em: rank + points */}
      <CompetitionStat icon={GitBranch} label={t("pickemRank")} rank={stats.pickem.rank} points={stats.pickem.points} />

      {/* 3 — Match picks: rank + points */}
      <CompetitionStat icon={Target} label={t("matchRank")} rank={stats.match.rank} points={stats.match.points} />

      {/* 4 — Next match: teams as main text, date as muted */}
      {nextMatch && kickoffDate && (
        <StatItem
          label={`${t("nextMatch")} · ${kickoffDate}`}
          icon={CalendarDays}
          value={
            <div className="flex items-center gap-1 font-heading text-sm md:text-base font-bold leading-tight truncate">
              {nextMatch.home_team?.flag_url && <img src={nextMatch.home_team.flag_url} alt="" className="inline size-4 mr-1 align-middle" />}
              <span className="sm:hidden lg:inline">{homeFifaCode}</span> {t("vs")} <span className="sm:hidden lg:inline">{awayFifaCode}</span>
              {nextMatch.away_team?.flag_url && <img src={nextMatch.away_team.flag_url} alt="" className="inline size-4 ml-1 align-middle" />}
            </div>
          }
        />
      )}
    </>
  );
}
