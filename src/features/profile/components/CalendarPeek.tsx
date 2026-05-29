"use client";

import { ArrowRight, Calendar, History, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { Match, Team } from "@/features/schedule/types/schedule.types";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { formatDateHeader, formatKickoffTime } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/utils";

type Props = {
  lastPlayed: Match | null;
  nextUpcoming: Match | null;
};

/**
 * Twin-row calendar peek: the most recently finished match on top, the
 * next upcoming match below. Each row surfaces the user's prediction
 * when present so this page acts as a personal scorecard, not a global
 * match list.
 *
 * Empty states are handled per row — if only one of the two exists
 * (pre-tournament or post-tournament), the other slot collapses cleanly
 * instead of showing a placeholder card.
 */
export function CalendarPeek({ lastPlayed, nextUpcoming }: Props) {
  const t = useTranslations("profile.calendarPeek");

  const hasAny = lastPlayed || nextUpcoming;

  return (
    <section aria-label={t("title")} className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Calendar aria-hidden className="size-4 text-page-accent-strong" />
            {t("title")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        {hasAny && (
          <Button asChild variant="ghost" size="sm" className="gap-1.5 self-start text-page-accent-strong hover:text-page-accent-strong sm:self-auto">
            <Link href="/schedule">
              {t("ctaOpenSchedule")}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </header>

      {!hasAny && <EmptyState label={t("empty")} />}

      {lastPlayed && <MatchRow match={lastPlayed} kind="last" />}
      {nextUpcoming && <MatchRow match={nextUpcoming} kind="next" />}
    </section>
  );
}

function MatchRow({ match, kind }: { match: Match; kind: "last" | "next" }) {
  const t = useTranslations("profile.calendarPeek");
  const locale = useLocale();
  const home = match.teams.home;
  const away = match.teams.away;
  if (!home || !away) return null;

  const kickoff = new Date(match.kickoff_at);
  const dateHeader = formatDateHeader(kickoff, locale);
  const time = formatKickoffTime(kickoff);

  const Icon = kind === "last" ? History : Sparkles;
  const labelKey = kind === "last" ? "labelLast" : "labelNext";

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      {/* Sub-header inside the row — uppercase label with an icon so the
          row is identifiable at a glance without needing the surrounding
          card title. The date+time span is timezone-dependent (server
          renders in UTC, client in the user's locale TZ), so we suppress
          the hydration warning rather than force UTC display. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-page-accent-strong">
          <Icon aria-hidden className="size-3" />
          {t(labelKey)}
        </span>
        <span className="text-2xs text-muted-foreground" suppressHydrationWarning>
          {dateHeader}{" "}
          <span aria-hidden className="text-muted-foreground/40">
            ·
          </span>{" "}
          {time}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <TeamSide team={home} align="left" />
        <ScoreCenter match={match} kind={kind} />
        <TeamSide team={away} align="right" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border pt-2 text-2xs">
        <span className="flex min-w-0 items-center gap-1 text-muted-foreground">
          <MapPin aria-hidden className="size-3 shrink-0" />
          <span className="truncate">{match.venue.city}</span>
        </span>
        <PickLine match={match} kind={kind} />
      </div>
    </article>
  );
}

function TeamSide({ team, align }: { team: Team; align: "left" | "right" }) {
  const locale = useLocale();
  const name = team.name[locale] ?? team.name.en ?? team.fifa_code;
  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-2", align === "right" ? "flex-row-reverse text-right" : "text-left")}>
      <Image src={team.flag_url} alt="" width={32} height={22} unoptimized className="h-5 w-7 shrink-0 rounded-xs object-cover" />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">{name}</span>
        <span className="text-2xs text-muted-foreground">{team.fifa_code}</span>
      </div>
    </div>
  );
}

/**
 * Centre block of the row. For a played match: render the *actual* score
 * (purple if user's pick matched, neutral otherwise). For an upcoming
 * match: render the user's pick badge or a "vs" sentinel.
 */
function ScoreCenter({ match, kind }: { match: Match; kind: "last" | "next" }) {
  const t = useTranslations("profile.calendarPeek");

  if (kind === "last" && match.result) {
    const { home_score, away_score } = match.result;
    const exact = match.user_score_pick && match.user_score_pick.home_score === home_score && match.user_score_pick.away_score === away_score;
    return (
      <span
        className={cn(
          "shrink-0 rounded-md border px-2 py-0.5 text-sm font-bold tabular-nums",
          exact ? "border-page-accent/40 bg-page-accent-soft text-page-accent-strong" : "border-border bg-muted text-foreground"
        )}
      >
        {home_score}–{away_score}
      </span>
    );
  }

  if (match.user_score_pick) {
    const { home_score, away_score } = match.user_score_pick;

    return (
      <div className="flex items-center gap-1 shrink-0 rounded-md border border-page-accent/30 bg-page-accent-soft px-2 py-0.5 text-sm font-bold tabular-nums text-page-accent-strong">
        <Sparkles className="size-3" />
        {home_score}–{away_score}
      </div>
    );
  }

  return <span className="shrink-0 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{t("vs")}</span>;
}

function PickLine({ match, kind }: { match: Match; kind: "last" | "next" }) {
  const t = useTranslations("profile.calendarPeek");
  const pick = match.user_score_pick;

  // Played match — always show a pick summary, whether the user predicted
  // it or not. Highlights an exact match with the accent colour.
  if (kind === "last" && match.result) {
    if (!pick) return <span className="text-muted-foreground">{t("noPickLast")}</span>;
    const exact = pick.home_score === match.result.home_score && pick.away_score === match.result.away_score;
    return (
      <span className={cn("font-medium", exact ? "text-page-accent-strong" : "text-muted-foreground")}>
        {t("yourPick", { home: pick.home_score, away: pick.away_score })}
        {exact ? <span className="ml-1 font-semibold">· {t("exactBadge")}</span> : null}
      </span>
    );
  }

  // Last match that kicked off but has no recorded result yet — show the
  // user's pick if any plus an "awaiting result" tag so the line tells
  // the user the row will fill in once scores land.
  if (kind === "last") {
    if (!pick) return <span className="text-muted-foreground">{t("awaitingResult")}</span>;
    return (
      <span className="font-medium text-muted-foreground">
        {t("yourPick", { home: pick.home_score, away: pick.away_score })}
        <span className="ml-1 text-2xs uppercase tracking-wider text-muted-foreground/80">· {t("awaitingResult")}</span>
      </span>
    );
  }

  // Upcoming match — show the pick if present, otherwise a CTA-style hint.
  if (pick) {
    return <span className="font-medium text-page-accent-strong">{t("yourPick", { home: pick.home_score, away: pick.away_score })}</span>;
  }
  return (
    <Link href={`/schedule#match-${match.id}`} className="font-medium text-page-accent-strong hover:underline">
      {t("pickThis")}
    </Link>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 bg-muted/30 p-6 text-center">
      <Calendar aria-hidden className="size-5 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
