"use client";

import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { useCountdown } from "../hooks/useCountdown";
import { TOURNAMENT_START_DATE } from "../lib/tournamentConfig";
import { UserDashboardStats } from "../types/dashboard.types";

import { UserStatsRow } from "./UserStatsRow";

type Props = {
  bracketProgress: { current: number; total: number };
  isNewUser?: boolean;
  stats: UserDashboardStats | null;
};

export function AuthHero({ bracketProgress, isNewUser = false, stats }: Props) {
  const t = useTranslations("dashboard.auth");
  const tWelcome = useTranslations("dashboard.auth.welcome");
  const countdown = useCountdown(TOURNAMENT_START_DATE);

  const scrollToTutorial = (behavior: ScrollBehavior = "smooth"): void => {
    const section = document.querySelector("#tutorial");
    section?.scrollIntoView({ behavior, block: "start" });
  };

  return (
    <section className="border-b border-border container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <Card className="relative p-4 sm:p-6 md:p-8 bg-linear-to-br from-primary/10 via-background to-background border-primary/20">
        <div
          className="
      pointer-events-none absolute inset-0
      opacity-[0.5] dark:opacity-[0.15]
    "
          style={{
            backgroundImage: "url('/banner-stadium.png')",
            backgroundPosition: "bottom right",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            maskImage: "radial-gradient(circle at bottom right, black 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at bottom right, black 0%, transparent 70%)",
          }}
        />
        <div
          className="
      pointer-events-none absolute inset-0
      bg-white/50 dark:bg-black/20
    "
        />
        <div className="flex flex-col gap-4 sm:gap-5 relative z-10">
          {!countdown.isExpired && (
            <span className="w-fit p-1.5 sm:p-3 rounded-lg bg-muted text-xs sm:text-sm text-muted-foreground">
              {t("countdown", { days: countdown.days, hours: countdown.hours, minutes: countdown.minutes })}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight max-w-full sm:max-w-3/4">{t("hero.title")}</h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-full sm:max-w-1/2">{t("hero.subtitle")}</p>

          {isNewUser ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-foreground">{tWelcome("subtitle")}</p>
              <Button onClick={() => scrollToTutorial()} className="w-full md:w-fit">
                {tWelcome("cta")}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button asChild variant="default" className="w-full sm:w-auto">
                <Link href="/bracket">
                  {bracketProgress.current === bracketProgress.total ? t("cta.seeMyBrackets") : t("cta.finishBracket")} → {bracketProgress.current}/
                  {bracketProgress.total}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/schedule">
                  <Calendar className="size-4" />
                  {t("cta.viewSchedule")}
                </Link>
              </Button>
            </div>
          )}
          {stats && <UserStatsRow stats={stats} />}
        </div>
      </Card>
    </section>
  );
}
