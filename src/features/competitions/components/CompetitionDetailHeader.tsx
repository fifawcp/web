"use client";

import { Award, CalendarDays, Clock, Crosshair, Flag, Hash, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AWARD_TYPES } from "@/features/awards/lib/awards";
import type { AwardType } from "@/features/awards/types/awards.types";
import type { PickemProgress } from "@/features/pickems/types/pickems.types";
import { useNow } from "@/features/schedule/hooks/useNow";
import type { Match } from "@/features/schedule/types/schedule.types";
import { formatKickoffTime, formatShortDate } from "@/shared/lib/dates";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";

import { useCompetitionName } from "../hooks/useCompetitionName";
import { competitionDeepLink } from "../lib/competitionDeepLink";
import { getCompetitionPickState } from "../lib/competitionPickStatus";
import { competitionTypeMeta } from "../lib/competitionTypeMeta";
import { resolveScope } from "../lib/formatScope";
import { resolvePickMatch } from "../lib/resolvePickMatch";
import type { Competition } from "../types/competitions.types";

import { CompetitionCountdown } from "./CompetitionCountdown";
import { PicksCta } from "./PicksCta";

type Props = {
  competition: Competition;
  matches: Match[];
  pickem: { progress: PickemProgress | null; isLocked: boolean } | null;
  awards: { pickedTypes: AwardType[]; isLocked: boolean } | null;
};

export function CompetitionDetailHeader({ competition, matches, pickem, awards }: Props) {
  const t = useTranslations("competitions");
  const tInfo = useTranslations("competitions.info");
  const competitionName = useCompetitionName();
  const now = useNow();

  const meta = competitionTypeMeta(competition.type);
  const Icon = meta.icon;
  const pickState = getCompetitionPickState(competition, matches, now, pickem ?? undefined, awards ?? undefined);
  const picksHref = competitionDeepLink(competition, pickState);
  const pickMatch = competition.type === "pick" ? resolvePickMatch(competition, matches) : null;

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cn("grid size-12 shrink-0 place-items-center rounded-lg", meta.tileClass)}>
            <Icon className="size-6" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{t(`type.${meta.labelKey}`)}</span>
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3 sm:gap-y-0.5">
              <h1 className="truncate font-heading text-xl font-bold tracking-tight">{competitionName(competition.name)}</h1>
              <ScopeLine competition={competition} matches={matches} />
            </div>
          </div>
        </div>
        {pickMatch ? <PickMeta match={pickMatch} /> : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <StatCard icon={Hash} label={tInfo("rank")} value={`#${competition.viewer.rank}`} />
          <StatCard icon={Star} label={tInfo("points")} value={competition.viewer.total_points.toLocaleString()} />
        </div>

        <div className="flex flex-col items-stretch gap-2.5 sm:items-end">
          <CompetitionCountdown pickState={pickState} now={now} className="justify-center sm:justify-end" />
          <PicksCta href={picksHref} state={pickState.kind} variant="header" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-border/60 px-3 py-2 sm:justify-start">
      <Icon className="size-4 shrink-0 text-page-accent-strong" aria-hidden />
      <span className="flex flex-col leading-tight">
        <span className="font-heading text-base font-semibold tabular-nums">{value}</span>
        <span className="text-2xs font-medium whitespace-nowrap text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}

// The subheader info, laid out as a single horizontal line under the name.
function ScopeLine({ competition, matches }: { competition: Competition; matches: Match[] }) {
  const tInfo = useTranslations("competitions.info");
  const locale = useLocale();

  if (competition.type === "pick") {
    const match = resolvePickMatch(competition, matches);
    if (!match) return null;
    const { home, away } = match.teams;
    return (
      <span className="text-sm font-medium text-foreground">
        {home ? getTeamName(home, locale) : "—"}
        <span className="text-muted-foreground"> vs </span>
        {away ? getTeamName(away, locale) : "—"}
      </span>
    );
  }

  if (competition.type === "awards") {
    return (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Award className="size-3.5" aria-hidden />
          {tInfo("awardsCount", { count: AWARD_TYPES.length })}
        </span>
      </span>
    );
  }

  const scope = resolveScope(competition);
  const stageCount = scope.isAllStages ? 7 : scope.stages.length;
  const teamCount = scope.isAllTeams ? 48 : scope.teamCodes.length;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Crosshair className="size-3.5" aria-hidden />
        {tInfo("stagesCount", { count: stageCount })}
      </span>
      <span className="inline-flex items-center gap-1">
        <Flag className="size-3.5" aria-hidden />
        {tInfo("teamsCount", { count: teamCount })}
      </span>
    </span>
  );
}

// Pick match date · time · stage as muted chips. Full width and spaced apart on mobile (it sits
// outside the icon-indented column); natural width on larger screens.
function PickMeta({ match }: { match: Match }) {
  const locale = useLocale();
  const tStages = useTranslations("schedule.filters.stage");
  const kickoff = new Date(match.kickoff_at);
  return (
    <div className="grid w-full grid-cols-3 gap-1.5 sm:flex sm:w-auto sm:gap-2">
      <MetaChip icon={CalendarDays}>{formatShortDate(kickoff, locale)}</MetaChip>
      <MetaChip icon={Clock}>{formatKickoffTime(kickoff)}</MetaChip>
      <MetaChip>{tStages(match.stage_code)}</MetaChip>
    </div>
  );
}

function MetaChip({ icon: Icon, children }: { icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; children: React.ReactNode }) {
  return (
    <span className="flex min-w-0 items-center justify-center gap-1.5 rounded-md bg-muted px-2 py-1.5 text-xs font-medium text-muted-foreground sm:justify-start sm:px-2.5">
      {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
