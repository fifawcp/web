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
    // `#tutorial-start` is the desktop scroller's trigger element; landing
    // on it puts the user exactly at the pin engagement point so step 1
    // is fully composed before they keep scrolling. The element is
    // `hidden md:block`, so on mobile we fall back to the section anchor
    // — which is what the mobile card layout uses for its own start.
    const desktop = document.querySelector("#tutorial-start") as HTMLElement | null;
    const target = desktop && desktop.offsetParent !== null ? desktop : document.querySelector("#tutorial");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        <Button onClick={scrollToTutorial} className="w-full bg-page-accent text-white hover:bg-page-accent/90 md:w-54">
          {t("welcome.cta")}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    );

  return <HeroCard badge={<HeroCountdownBadge />} primaryCta={{ href: primaryCtaHref, label: primaryCtaLabel }} bottomContent={bottomContent} />;
}
