"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

import { useCountdown } from "../hooks/useCountdown";
import { TOURNAMENT_START_DATE } from "../lib/tournamentConfig";
import type { DashboardStats } from "../types/dashboard.types";

import { HeroCard } from "./HeroCard";
import { UserStatsRow } from "./UserStatsRow";

type Props = {
  stats: DashboardStats | null;
  isPickemComplete: boolean;
};

export function AuthHero({ stats, isPickemComplete }: Props) {
  const t = useTranslations("dashboard.hero");
  const countdown = useCountdown(TOURNAMENT_START_DATE);

  const scrollToTutorial = (): void => {
    document.querySelector("#tutorial")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const badge = (
    <span className="w-fit p-1.5 sm:p-3 rounded-lg bg-muted text-xs sm:text-sm text-muted-foreground">
      {!countdown.isExpired ? t("countdown", { days: countdown.days, hours: countdown.hours, minutes: countdown.minutes }) : t("badge")}
    </span>
  );

  const primaryCtaLabel = isPickemComplete || countdown.isExpired ? t("cta.seeMyBrackets") : t("cta.finishBracket");

  const bottomContent = stats ? (
    <UserStatsRow stats={stats} />
  ) : (
    <div className="flex flex-col gap-2 py-2 sm:py-3">
      <p className="text-sm text-foreground">{t("welcome.subtitle")}</p>
      <Button onClick={scrollToTutorial} className="w-full md:w-fit">
        {t("welcome.cta")}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );

  return <HeroCard badge={badge} primaryCta={{ href: "/bracket", label: primaryCtaLabel }} bottomContent={bottomContent} />;
}
