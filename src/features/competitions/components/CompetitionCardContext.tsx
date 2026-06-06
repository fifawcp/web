"use client";

import { CalendarDays, Crosshair, Flag, LayoutGrid, Medal, Network } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { PickemProgress, StepProgress } from "@/features/pickems/types/pickems.types";
import type { Match } from "@/features/schedule/types/schedule.types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { formatKickoffTime, formatShortDate } from "@/shared/lib/dates";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { StageCode, Team } from "@/shared/types/wcp.types";

import type { CompetitionPickState } from "../lib/competitionPickStatus";
import { ALL_STAGES, resolveScope } from "../lib/formatScope";
import { resolvePoolMatch } from "../lib/resolvePoolMatch";
import type { Competition } from "../types/competitions.types";

import { CompetitionCountdown } from "./CompetitionCountdown";
import { FlagStack } from "./scopeBits";

// Every variant is the SAME fixed height so the subheader boxes line up across competition types.
const CONTEXT_BOX = "flex h-32 flex-col gap-2.5 rounded-lg bg-muted p-3";

// Compact, language-neutral stage abbreviations for the custom scope chips.
const STAGE_SHORT: Record<StageCode, string> = {
  group_stage: "GS",
  round_of_32: "R32",
  round_of_16: "R16",
  quarterfinals: "QF",
  semifinals: "SF",
  third_place: "3rd",
  final: "F",
};

// Shared subheader: a small uppercase label on the left, the lock countdown pinned top-right. The
// uppercase lives on the label span only, so it never bleeds into the countdown's casing.
function ContextHeader({ label, pickState, now }: { label: string; pickState: CompetitionPickState; now: Date }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-2xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <CompetitionCountdown pickState={pickState} now={now} className="shrink-0" />
    </div>
  );
}

type Props = {
  competition: Competition;
  matches: Match[];
  teamsByCode: Map<string, Team>;
  pickState: CompetitionPickState;
  pickemProgress: PickemProgress | null;
  now: Date;
};

export function CompetitionCardContext({ competition, matches, teamsByCode, pickState, pickemProgress, now }: Props) {
  if (competition.type === "pool") {
    return <PoolContext competition={competition} matches={matches} pickState={pickState} now={now} />;
  }
  if (competition.type === "pickem" && pickemProgress) {
    return <PickemContext progress={pickemProgress} pickState={pickState} now={now} />;
  }
  return <ScopeContext competition={competition} teamsByCode={teamsByCode} pickState={pickState} now={now} />;
}

// pick'em: the viewer's progress through the three predicting steps — useful, actionable info.
function PickemContext({ progress, pickState, now }: { progress: PickemProgress; pickState: CompetitionPickState; now: Date }) {
  const t = useTranslations("competitions.card");
  const steps = [
    { key: "groups", icon: LayoutGrid, p: progress.groups },
    { key: "thirds", icon: Medal, p: progress.best_thirds },
    { key: "bracket", icon: Network, p: progress.bracket },
  ] as const;

  return (
    <div className={CONTEXT_BOX}>
      <ContextHeader label={t("pickem.progress")} pickState={pickState} now={now} />
      <div className="grid flex-1 grid-cols-3 gap-1.5">
        {steps.map(({ key, icon: Icon, p }) => (
          <PickemStep key={key} icon={Icon} label={t(`pickem.${key}`)} progress={p} />
        ))}
      </div>
    </div>
  );
}

function PickemStep({
  icon: Icon,
  label,
  progress,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  progress: StepProgress;
}) {
  const done = progress.completed >= progress.total && progress.total > 0;
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-1 rounded-md bg-card px-2 py-2 text-center ring-1 ring-foreground/5", done && "ring-page-accent/30")}
    >
      <Icon className={cn("size-4", done ? "text-page-accent-strong" : "text-muted-foreground")} aria-hidden />
      <span className="text-2xs font-medium text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-xs font-semibold tabular-nums", done ? "text-page-accent-strong" : "text-foreground")}>
        {progress.completed}/{progress.total}
      </span>
    </div>
  );
}

// custom (match): the stage range it covers + the teams in play.
function ScopeContext({
  competition,
  teamsByCode,
  pickState,
  now,
}: {
  competition: Competition;
  teamsByCode: Map<string, Team>;
  pickState: CompetitionPickState;
  now: Date;
}) {
  const t = useTranslations("competitions.card");
  const tInfo = useTranslations("competitions.info");
  const scope = resolveScope(competition);
  const ordered = [...scope.stages].sort((a: StageCode, b: StageCode) => ALL_STAGES.indexOf(a) - ALL_STAGES.indexOf(b));
  const stageCount = scope.isAllStages ? ALL_STAGES.length : ordered.length;
  const teamCount = scope.isAllTeams ? teamsByCode.size : scope.teamCodes.length;

  return (
    <div className={CONTEXT_BOX}>
      <ContextHeader label={t("scope")} pickState={pickState} now={now} />
      <div className="grid flex-1 grid-cols-2 gap-1.5">
        <ScopeTile icon={Crosshair} label={t("stages")} subtitle={tInfo("stagesCount", { count: stageCount })}>
          {scope.isAllStages ? <span className="truncate text-sm font-semibold">{t("allStages")}</span> : <StageChipStack stages={ordered} />}
        </ScopeTile>
        <ScopeTile icon={Flag} label={t("teams")} subtitle={tInfo("teamsCount", { count: teamCount })}>
          {scope.isAllTeams ? (
            <span className="truncate text-sm font-semibold">{t("allTeamsShort")}</span>
          ) : (
            <FlagStack teamCodes={scope.teamCodes} teamsByCode={teamsByCode} />
          )}
        </ScopeTile>
      </div>
    </div>
  );
}

function ScopeTile({
  icon: Icon,
  label,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-center gap-1 rounded-md bg-card px-2.5 py-2 ring-1 ring-foreground/5">
      <span className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5 shrink-0 text-page-accent-strong" aria-hidden />
        {label}
      </span>
      <div className="flex min-h-5 min-w-0 items-center">{children}</div>
      <span className="text-2xs text-muted-foreground tabular-nums">{subtitle}</span>
    </div>
  );
}

// Short stage chips on a single row; overflow collapses to a +N chip (tooltip lists the rest) so the
// tile keeps its fixed height on narrow screens — same strategy as the team flag stack.
function StageChipStack({ stages, max = 4 }: { stages: StageCode[]; max?: number }) {
  const tStages = useTranslations("schedule.filters.stage");
  const shown = stages.slice(0, max);
  const rest = stages.length - shown.length;

  const chips = (
    <div className="flex w-full items-center gap-1 overflow-hidden">
      {shown.map((s) => (
        <span key={s} className="shrink-0 rounded-xs bg-page-accent-soft px-1 py-0.5 text-2xs font-semibold text-page-accent-strong">
          {STAGE_SHORT[s]}
        </span>
      ))}
      {rest > 0 ? <span className="shrink-0 rounded-xs bg-card px-1 py-0.5 text-2xs font-semibold text-muted-foreground ring-1 ring-border">+{rest}</span> : null}
    </div>
  );

  if (rest === 0) return chips;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{chips}</TooltipTrigger>
      <TooltipContent>{stages.map((s) => tStages(s)).join(", ")}</TooltipContent>
    </Tooltip>
  );
}

// pool: a compact schedule-style card for the single covered match.
function PoolContext({ competition, matches, pickState, now }: { competition: Competition; matches: Match[]; pickState: CompetitionPickState; now: Date }) {
  const locale = useLocale();
  const tStages = useTranslations("schedule.filters.stage");
  const t = useTranslations("competitions.card");
  const match = resolvePoolMatch(competition, matches);

  if (!match) {
    return <div className={cn(CONTEXT_BOX, "items-center text-center text-xs text-muted-foreground")}>{t("matchUnavailable")}</div>;
  }

  const { home, away } = match.teams;
  const kickoff = new Date(match.kickoff_at);
  const result = match.result;

  return (
    <div className={cn(CONTEXT_BOX, "justify-between")}>
      <ContextHeader label={tStages(match.stage_code)} pickState={pickState} now={now} />

      <div className="flex items-center gap-2">
        <PoolTeam team={home} locale={locale} side="home" />
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">{result ? `${result.home_score}–${result.away_score}` : t("vs")}</span>
        <PoolTeam team={away} locale={locale} side="away" />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-2xs text-muted-foreground">
        <span className="font-mono font-medium tabular-nums">M{match.id}</span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          {formatShortDate(kickoff, locale)} · {formatKickoffTime(kickoff)}
        </span>
      </div>
    </div>
  );
}

// One side of a pool match, schedule-style: flag on the outer edge, name + FIFA code on the inner.
function PoolTeam({ team, locale, side }: { team: Team | null; locale: string; side: "home" | "away" }) {
  const flag = (
    <span className="shrink-0 overflow-hidden rounded-xs ring-1 ring-foreground/10">
      {team?.flag_url ? (
        <Image src={team.flag_url} alt={team.fifa_code} width={32} height={22} className="h-[22px] w-8 object-cover" />
      ) : (
        <span className="grid h-[22px] w-8 place-items-center bg-card text-2xs font-semibold">{team?.fifa_code ?? "?"}</span>
      )}
    </span>
  );
  const label = (
    <span className={cn("flex min-w-0 flex-col leading-tight", side === "away" && "items-end text-right")}>
      <span className="truncate text-sm font-semibold">{team ? getTeamName(team, locale) : "—"}</span>
      <span className="text-2xs text-muted-foreground">{team?.fifa_code ?? "—"}</span>
    </span>
  );

  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-2", side === "home" ? "justify-start" : "justify-end")}>
      {side === "home" ? (
        <>
          {flag}
          {label}
        </>
      ) : (
        <>
          {label}
          {flag}
        </>
      )}
    </div>
  );
}
