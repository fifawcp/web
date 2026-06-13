"use client";

import { Award, Crosshair, Flag, Hash, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { AWARD_TYPES } from "@/features/awards/lib/awards";
import type { AwardType } from "@/features/awards/types/awards.types";
import type { PickemProgress } from "@/features/pickems/types/pickems.types";
import { useNow } from "@/features/schedule/hooks/useNow";
import type { Match } from "@/features/schedule/types/schedule.types";
import { StatPill } from "@/shared/components/StatPill";
import { cn } from "@/shared/lib/utils";

import { useCompetitionName } from "../hooks/useCompetitionName";
import { competitionDeepLink } from "../lib/competitionDeepLink";
import { getCompetitionPickState } from "../lib/competitionPickStatus";
import { competitionTypeMeta } from "../lib/competitionTypeMeta";
import { resolveScope } from "../lib/formatScope";
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
  const isPick = competition.type === "pick";

  const titleBlock = (
    <div className="flex min-w-0 items-start gap-3">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg sm:size-12", meta.tileClass)}>
        <Icon className="size-5 sm:size-6" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <span className="text-2xs font-medium tracking-wide text-muted-foreground uppercase">{t(`type.${meta.labelKey}`)}</span>
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3 sm:gap-y-0.5">
          <h1 className="truncate font-heading text-xl font-bold tracking-tight">{competitionName(competition.name)}</h1>
          <ScopeLine competition={competition} />
        </div>
      </div>
    </div>
  );

  // A single-match pick competition: its position/points and status live in the
  // breakdown below, so the header is just the fixture name + the pick CTA.
  if (isPick) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4 lg:pb-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg sm:size-12", meta.tileClass)}>
            <Icon className="size-5 sm:size-6" aria-hidden />
          </span>
          <h1 className="truncate font-heading text-xl font-bold tracking-tight">{competitionName(competition.name)}</h1>
        </div>
        <div className="shrink-0">
          <PicksCta href={picksHref} state={pickState.kind} variant="header" singular />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:pb-5">
      {titleBlock}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <StatPill icon={Hash} label={tInfo("rank")} value={`#${competition.viewer.rank}`} />
          <StatPill icon={Star} label={tInfo("points")} value={competition.viewer.total_points.toLocaleString()} />
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2.5">
          <CompetitionCountdown pickState={pickState} now={now} className="justify-start sm:justify-end" />
          <PicksCta href={picksHref} state={pickState.kind} variant="header" />
        </div>
      </div>
    </div>
  );
}

// The subheader info under the name. Pick competitions show the fixture in the
// match card below, so they have no scope line here.
function ScopeLine({ competition }: { competition: Competition }) {
  const tInfo = useTranslations("competitions.info");

  if (competition.type === "pick") return null;

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
