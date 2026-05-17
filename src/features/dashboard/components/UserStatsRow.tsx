"use client";

import React from "react";
import { CalendarDays, GitBranch, Target, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { formatShortDate } from "@/shared/lib/dates";

import type { DashboardStats, Match, Team } from "../types/dashboard.types";

type Props = {
  pickedChampion: Team | null;
  stats: DashboardStats;
  nextMatch: Match | null;
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
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted ${!iconContent ? "xl:hidden" : ""}`}>
        {iconContent || (icon && React.createElement(icon, { className: "size-7 text-muted-foreground" }))}
      </div>

      <div className="flex flex-col sm:text-center xl:text-start min-w-0 flex-1 gap-1">
        <span className="text-xs sm:text-2xs xl:text-xs h-5 md:h-auto flex items-center uppercase tracking-wider text-muted-foreground leading-none md:justify-center xl:justify-start">
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

export function UserStatsRow({ pickedChampion, stats, nextMatch }: Props) {
  const t = useTranslations("dashboard.stats");
  const locale = useLocale();

  const championName = pickedChampion?.name[locale] ?? pickedChampion?.name["en"] ?? "—";
  const kickoffDate = nextMatch ? formatShortDate(new Date(nextMatch.kickoff_at), locale) : null;
  const homeTeam = nextMatch?.teams.home ?? null;
  const awayTeam = nextMatch?.teams.away ?? null;

  return (
    <>
      {/* 1 — Predicted champion */}
      <StatItem
        label={t("predictedChampion")}
        icon={Trophy}
        iconContent={pickedChampion?.flag_url && <img src={pickedChampion.flag_url} alt={pickedChampion.fifa_code} className="size-7 object-contain" />}
        value={<span className="font-heading text-sm md:text-base xl:text-lg font-bold leading-tight truncate">{championName}</span>}
      />

      {/* 2 — Pick'em: rank + points */}
      <CompetitionStat icon={GitBranch} label={t("pickemRank")} rank={stats.pickem.rank} points={stats.pickem.points} />

      {/* 3 — Match picks: rank + points */}
      <CompetitionStat icon={Target} label={t("matchRank")} rank={stats.match.rank} points={stats.match.points} />

      {/* 4 — Next match */}
      {nextMatch && kickoffDate && (
        <StatItem
          label={`${t("nextMatch")} · ${kickoffDate}`}
          icon={CalendarDays}
          value={
            <div className="flex items-center sm:justify-center xl:justify-start gap-2 font-heading text-sm md:text-base font-bold leading-tight truncate text-muted-foreground">
              {homeTeam?.flag_url && <img src={homeTeam.flag_url} alt="" className="inline h-3.5 w-5.5 align-middle" />}
              <span className="sm:hidden lg:inline text-foreground">{homeTeam?.fifa_code ?? ""}</span> {t("vs")}{" "}
              <span className="sm:hidden lg:inline text-foreground">{awayTeam?.fifa_code ?? ""}</span>
              {awayTeam?.flag_url && <img src={awayTeam.flag_url} alt="" className="inline h-3.5 w-5.5 align-middle" />}
            </div>
          }
        />
      )}
    </>
  );
}
