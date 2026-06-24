"use client";

import { useMemo } from "react";
import { ArrowRight, Check, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";

import { useCountdown } from "../hooks/useCountdown";
import { formatCountdownShort } from "../lib/formatCountdown";
import type { Match, Team } from "../types/dashboard.types";

import { CardReveal } from "./CardReveal";

type Props = {
  match: Match;
  isLoggedIn: boolean;
  delay?: number;
  className?: string;
  // Set when two cards sit side by side (simultaneous matches): the card is ~half
  // width, so the team names stay capped instead of scaling up to the full-width size.
  compact?: boolean;
};

// Primary "what to do next" card: the next upcoming match with the user's pick state.
export function FeaturedMatchCard({ match, isLoggedIn, delay, className, compact = false }: Props) {
  const t = useTranslations("dashboard.featured");
  const stageT = useTranslations("schedule.filters.stage");
  const locale = useLocale();

  const kickoff = useMemo(() => new Date(match.kickoff_at), [match.kickoff_at]);
  const countdown = useCountdown(kickoff);
  const isLocked = countdown.isExpired;
  const pick = match.user_score_pick;

  const stageLabel = match.stage_code === "group_stage" && match.group_code ? t("stage.group", { group: match.group_code }) : stageT(match.stage_code);

  return (
    <CardReveal
      delay={delay}
      className={cn("opacity-0 relative gap-5 border border-page-accent/30 bg-card p-4 shadow-[0_6px_22px_-18px_var(--page-accent)] sm:p-6", className)}
    >
      {/* Top accent line (clipped by the card's rounded corners) */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-page-accent to-page-accent/40" />

      <header className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-wide text-page-accent-strong">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-page-accent opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-page-accent" />
          </span>
          {t("kicker")}
        </span>
        <span className="font-medium uppercase tracking-wide">{stageLabel}</span>
      </header>

      {/* Teams row — center holds only the score/VS so names get the full column width */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <TeamColumn team={match.teams.home} locale={locale} align="start" compact={compact} />

        <div data-depth="12" className="flex shrink-0 flex-col items-center justify-center gap-1 px-1">
          {pick ? (
            <>
              <span className="font-heading text-2xl font-bold tabular-nums leading-none text-foreground sm:text-3xl">
                {pick.home_score}
                <span className="mx-1 text-muted-foreground/60 sm:mx-1.5">–</span>
                {pick.away_score}
              </span>
              <span className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{t("yourPick")}</span>
            </>
          ) : (
            <span className="font-heading text-lg font-bold leading-none text-muted-foreground/60 sm:text-xl">{t("vs")}</span>
          )}
        </div>

        <TeamColumn team={match.teams.away} locale={locale} align="end" compact={compact} />
      </div>

      {/* Meta row — countdown + venue, full width below the teams */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-2xs text-muted-foreground sm:text-xs">
        {!isLocked && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1" suppressHydrationWarning>
            <Clock className="size-3.5 shrink-0" aria-hidden />
            {t.rich("kickoffIn", {
              time: formatCountdownShort(countdown),
              // The countdown value differs between server and client render (1s drift);
              // suppress on the node that holds the changing text — the interval corrects it on mount.
              val: (c) => (
                <span suppressHydrationWarning className="inline-block font-semibold tabular-nums text-page-accent-strong">
                  {c}
                </span>
              ),
            })}
          </span>
        )}
        <span className="inline-flex min-w-0 items-center gap-1">
          <MapPin className="size-3 shrink-0" aria-hidden />
          <span className="truncate">
            {match.venue.name} · {match.venue.city}
          </span>
        </span>
      </div>

      <footer className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <PickStatus isLoggedIn={isLoggedIn} hasPick={pick != null} t={t} />
        <FeaturedCta isLoggedIn={isLoggedIn} hasPick={pick != null} isLocked={isLocked} matchId={match.id} t={t} />
      </footer>
    </CardReveal>
  );
}

function TeamColumn({ team, locale, align, compact }: { team: Team | null; locale: string; align: "start" | "end"; compact: boolean }) {
  const alignClass = align === "start" ? "items-start text-left" : "items-end text-right";
  // Full-width cards let names grow to text-2xl; a side-by-side (compact) card is too
  // narrow for that, so cap names at text-lg to keep them clear of the centered score.
  const nameClass = compact ? "text-base sm:text-lg" : "text-base sm:text-lg lg:text-xl xl:text-2xl";
  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5", alignClass)}>
      {team ? (
        <Image src={team.flag_url} alt="" width={56} height={40} sizes="56px" data-depth="9" className="h-9 w-13 rounded-xs object-cover shadow-sm sm:h-10 sm:w-14" />
      ) : (
        <div className="h-9 w-13 rounded-xs bg-muted sm:h-10 sm:w-14" />
      )}
      <span className={cn("max-w-full truncate font-bold tracking-tight", nameClass)}>{team ? getTeamName(team, locale) : "TBD"}</span>
    </div>
  );
}

type SectionT = ReturnType<typeof useTranslations<"dashboard.featured">>;

function PickStatus({ isLoggedIn, hasPick, t }: { isLoggedIn: boolean; hasPick: boolean; t: SectionT }) {
  if (!isLoggedIn) {
    return <span className="text-xs text-muted-foreground">{t("guestHint")}</span>;
  }

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          hasPick ? "bg-lime-500/15 text-lime-700 dark:text-lime-400" : "bg-red-500/15 text-red-600 dark:text-red-400"
        )}
      >
        {hasPick ? <Check className="size-4" aria-hidden /> : <Clock className="size-4" aria-hidden />}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">{hasPick ? t("picked") : t("notPicked")}</span>
        <span className="text-xs text-muted-foreground">{hasPick ? t("pickedHint") : t("notPickedHint")}</span>
      </div>
    </div>
  );
}

// Large, prominent CTA so the featured match reads as the primary action.
// `text-white` (not text-background) keeps the label light in dark mode too.
const CTA_CLASS = "h-12 w-full gap-2 px-6 text-[15px] font-semibold sm:w-auto bg-page-accent text-white hover:bg-page-accent/90";

function FeaturedCta({ isLoggedIn, hasPick, isLocked, matchId, t }: { isLoggedIn: boolean; hasPick: boolean; isLocked: boolean; matchId: number; t: SectionT }) {
  if (!isLoggedIn) {
    return (
      <Button asChild className={CTA_CLASS}>
        <Link href="/register">
          {t("cta.signUp")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
    );
  }

  if (isLocked) {
    return (
      <Button disabled variant="outline" className="h-12 w-full px-6 text-[15px] sm:w-auto">
        {t("locked")}
      </Button>
    );
  }

  return (
    <Button asChild className={CTA_CLASS}>
      <Link href={`/schedule?match=${matchId}&edit=1`}>
        {hasPick ? t("cta.edit") : t("cta.make")}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </Button>
  );
}
