"use client";

import { ChartColumn, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { formatShortDate } from "@/shared/lib/dates";

import { useCountdown } from "../hooks/useCountdown";
import { TOURNAMENT_END_DATE, TOURNAMENT_START_DATE, TOURNAMENT_STATS } from "../lib/tournamentConfig";

// Countdown pill shared by both the guest and authenticated hero.
export function HeroCountdownBadge() {
  const t = useTranslations("dashboard.hero");
  const countdown = useCountdown(TOURNAMENT_START_DATE);

  return (
    <span className="w-fit p-1.5 sm:p-3 rounded-lg bg-muted text-xs sm:text-sm text-muted-foreground">
      {!countdown.isExpired ? t("countdown", { days: countdown.days, hours: countdown.hours, minutes: countdown.minutes }) : t("badge")}
    </span>
  );
}

export function GuestHeroStats() {
  const t = useTranslations("dashboard.hero.tournamentStats");
  const locale = useLocale();
  const countdown = useCountdown(TOURNAMENT_START_DATE);
  const endCountdown = useCountdown(TOURNAMENT_END_DATE);

  const isExpired = countdown.isExpired;
  const label = isExpired ? t("tournamentEnds") : t("tournamentBegins");
  const date = isExpired ? formatShortDate(TOURNAMENT_END_DATE, locale) : formatShortDate(TOURNAMENT_START_DATE, locale);
  const activeCountdown = isExpired ? endCountdown : countdown;

  const countdownItems = [
    { value: activeCountdown.days, label: t("days") },
    { value: activeCountdown.hours, label: t("hours") },
    { value: activeCountdown.minutes, label: t("minutes") },
    { value: activeCountdown.seconds, label: t("seconds") },
  ];

  const stats = [
    { label: t("totalMatches"), value: TOURNAMENT_STATS.totalMatches },
    { label: t("groupMatches"), value: TOURNAMENT_STATS.groupMatches },
    { label: t("knockouts"), value: TOURNAMENT_STATS.knockoutMatches },
    { label: t("teams"), value: TOURNAMENT_STATS.teams },
  ];

  const containerStyles =
    "flex items-center flex-col gap-2 flex-1 px-2 sm:px-3 pt-2 md:pt-3  pb-2 md:pb-0 min-w-0 border-b sm:border-b-0 border-gray-400 dark:border-border";
  return (
    <>
      {/* Countdown */}
      <div className={containerStyles}>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3 text-muted-foreground" />
          <span className="text-2xs uppercase tracking-wider text-muted-foreground">
            {label} · {date}
          </span>
        </div>
        <div className="flex gap-3">
          {countdownItems.map(({ value, label }, i) => (
            <div key={label} className="flex items-start gap-2 lg:gap-3">
              {i > 0 && <span className="font-heading text-xl  leading-none mt-1">:</span>}
              <div className="flex flex-col items-center gap-1">
                <span className="font-heading text-xl sm:text-2xl md:text-3xl font-bold tabular-nums leading-none" suppressHydrationWarning>
                  {String(value).padStart(2, "0")}
                </span>
                <span className="text-2xs uppercase tracking-wider text-muted-foreground">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tournament stats */}
      <div className={containerStyles}>
        <div className="flex items-center gap-1.5">
          <ChartColumn className="size-3 text-muted-foreground" />
          <span className="text-2xs uppercase tracking-wider text-muted-foreground">{t("tournamentByNumbers")}</span>
        </div>
        <div className="flex gap-2 lg:gap-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="font-heading text-xl sm:text-2xl md:text-3xl font-bold tabular-nums leading-none">{value}</span>
              <span className="text-2xs uppercase tracking-wider text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
