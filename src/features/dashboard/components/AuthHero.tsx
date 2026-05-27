"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

import { useCountdown } from "../hooks/useCountdown";
import { isAllPickemComplete } from "../lib/pickStatusDerivations";
import { TOURNAMENT_START_DATE } from "../lib/tournamentConfig";
import type { DashboardStats, Match, PickemProgress, Team } from "../types/dashboard.types";

import { HeroCountdownBadge } from "./GuestHeroCountdown";
import { HeroCard } from "./HeroCard";
import { UserStatsRow } from "./UserStatsRow";

type Props = {
  pickedChampion: Team | null;
  stats: DashboardStats | null;
  nextMatch: Match | null;
  pickemProgress: PickemProgress | null;
};

export function AuthHero({ pickedChampion, stats, nextMatch, pickemProgress }: Props) {
  const t = useTranslations("dashboard.hero");
  const countdown = useCountdown(TOURNAMENT_START_DATE);

  const scrollToTutorial = (): void => {
    document.querySelector("#tutorial")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isPickemComplete = pickemProgress ? isAllPickemComplete(pickemProgress) : false;
  const primaryCtaLabel = isPickemComplete || countdown.isExpired ? t("cta.seeMyBrackets") : t("cta.finishBracket");
  const primaryCtaHref = isPickemComplete || countdown.isExpired ? "/bracket" : "/pickems";

  const bottomContent =
    stats && (isPickemComplete || countdown.isExpired) ? (
      <UserStatsRow pickedChampion={pickedChampion} stats={stats} nextMatch={nextMatch} />
    ) : (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-foreground">{t("welcome.subtitle")}</p>
        <Button onClick={scrollToTutorial} className="w-full md:w-fit bg-page-accent text-white hover:bg-page-accent/90">
          {t("welcome.cta")}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    );

  return <HeroCard badge={<HeroCountdownBadge />} primaryCta={{ href: primaryCtaHref, label: primaryCtaLabel }} bottomContent={bottomContent} />;
}
