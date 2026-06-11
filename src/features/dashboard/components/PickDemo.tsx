"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Check, Minus } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { MatchScorePicker } from "@/features/schedule/components/MatchScorePicker";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";

import type { Team, UserScorePick } from "../types/dashboard.types";

const HOME: Team = { fifa_code: "ARG", name: { en: "Argentina", es: "Argentina" }, flag_url: "https://flagcdn.com/w320/ar.png", group_code: null };
const AWAY: Team = { fifa_code: "BRA", name: { en: "Brazil", es: "Brasil" }, flag_url: "https://flagcdn.com/w320/br.png", group_code: null };
const FINAL = { home_score: 2, away_score: 1 };

type Outcome = "exact" | "correct" | "miss";
const POINTS: Record<Outcome, number> = { exact: 5, correct: 2, miss: 0 };

// Exact = true green (best), correct = yellow-green lime (partial), miss = muted.
const STYLES: Record<Outcome, { panel: string; iconWrap: string; label: string; points: string }> = {
  exact: {
    panel: "border-green-500/30 bg-green-500/10",
    iconWrap: "bg-green-500/15 text-green-600 dark:text-green-400",
    label: "text-green-700 dark:text-green-400",
    points: "text-green-600 dark:text-green-400",
  },
  correct: {
    panel: "border-lime-500/40 bg-lime-400/15",
    iconWrap: "bg-lime-400/20 text-lime-600 dark:text-lime-400",
    label: "text-lime-700 dark:text-lime-400",
    points: "text-lime-600 dark:text-lime-400",
  },
  miss: {
    panel: "border-border bg-muted",
    iconWrap: "bg-background text-muted-foreground",
    label: "text-foreground",
    points: "text-muted-foreground",
  },
};

function scoreOutcome(pick: UserScorePick): Outcome {
  if (pick.home_score === FINAL.home_score && pick.away_score === FINAL.away_score) return "exact";
  const picked = Math.sign(pick.home_score - pick.away_score);
  const actual = Math.sign(FINAL.home_score - FINAL.away_score);
  return picked === actual ? "correct" : "miss";
}

// Interactive "how it works": predict a sample score and watch points update live.
export function PickDemo() {
  const t = useTranslations("dashboard.landing.demo");
  const locale = useLocale();
  const [pick, setPick] = useState<UserScorePick>({ home_score: 1, away_score: 1 });

  const outcome = scoreOutcome(pick);
  const points = POINTS[outcome];
  const style = STYLES[outcome];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3 sm:px-6">
        <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{t("yourPick")}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-border">
          {t("final")}
          <span className="font-bold tabular-nums text-foreground">
            {FINAL.home_score}&ndash;{FINAL.away_score}
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-5 p-4 sm:p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
          <DemoTeam team={HOME} locale={locale} align="start" />
          <MatchScorePicker home={pick.home_score} away={pick.away_score} onChange={setPick} />
          <DemoTeam team={AWAY} locale={locale} align="end" />
        </div>

        <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors", style.panel)}>
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", style.iconWrap)}>
            {outcome === "miss" ? <Minus className="size-5" aria-hidden /> : <Check className="size-5" aria-hidden />}
          </span>
          <div className="flex flex-1 flex-col leading-tight">
            <span className={cn("text-sm font-semibold", style.label)}>{t(outcome)}</span>
            <span className="text-xs text-muted-foreground">{t("rule")}</span>
          </div>
          <span className={cn("font-heading text-2xl font-bold tabular-nums", style.points)}>{t("points", { points })}</span>
        </div>

        <Button asChild className="h-11 w-full gap-2 bg-page-accent text-white hover:bg-page-accent/90">
          <Link href="/schedule">
            <CalendarDays className="size-4" aria-hidden />
            {t("cta")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Flag + name + fifa code, laid out like a schedule match card (name beside the flag).
function DemoTeam({ team, locale, align }: { team: Team; locale: string; align: "start" | "end" }) {
  const isHome = align === "start";
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", isHome ? "flex-row" : "flex-row-reverse")}>
      <Image src={team.flag_url} alt="" width={48} height={34} sizes="48px" className="h-8 w-11 shrink-0 rounded-xs object-cover shadow-sm" />
      <div className={cn("flex min-w-0 flex-col leading-tight", isHome ? "items-start text-left" : "items-end text-right")}>
        <span className="max-w-full truncate text-sm font-semibold">{getTeamName(team, locale)}</span>
        <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{team.fifa_code}</span>
      </div>
    </div>
  );
}
