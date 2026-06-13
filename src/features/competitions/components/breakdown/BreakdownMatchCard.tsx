import { MapPin } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { MatchStatusBadge } from "@/features/schedule/components/MatchStatusBadge";
import type { Match, MatchResult, Team } from "@/features/schedule/types/schedule.types";
import { formatKickoffTime } from "@/shared/lib/dates";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";

import type { MemberPickRow } from "../../lib/computeMatchBreakdown";

type Props = {
  match: Match;
  // The viewer's own row, shown under the result like the schedule card's pick hint.
  yourRow: MemberPickRow | null;
};

// Schedule-style fixture card: teams (flag · name · code), the result with the
// viewer's pick beneath it, and the venue + lock status in the footer.
export function BreakdownMatchCard({ match, yourRow }: Props) {
  const t = useTranslations("competitions.breakdown");
  const stageT = useTranslations("schedule.filters.stage");
  const tCard = useTranslations("schedule.card");
  const locale = useLocale();

  const kickoff = new Date(match.kickoff_at);
  const dateLabel = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(kickoff);
  const penalties = match.result?.penalties ?? null;
  const penaltiesText = penalties ? t("penalties", { home: penalties.home, away: penalties.away }) : null;
  const stageLabel =
    match.stage_code === "group_stage" && match.group_code ? `${tCard("group")} ${match.group_code} · M${match.id}` : `${stageT(match.stage_code)} · M${match.id}`;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <span className="truncate text-xs font-semibold tracking-wide text-muted-foreground uppercase">{stageLabel}</span>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {dateLabel} · {formatKickoffTime(kickoff)}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-5 sm:gap-4">
        <TeamSide team={match.teams.home} locale={locale} align="start" />
        <CenterScore result={match.result} vsLabel={t("vs")} penaltiesText={penaltiesText} yourRow={yourRow} />
        <TeamSide team={match.teams.away} locale={locale} align="end" />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {match.venue.name} · {match.venue.city}
          </span>
        </span>
        <MatchStatusBadge state="locked" className="shrink-0" />
      </div>
    </div>
  );
}

function TeamSide({ team, locale, align }: { team: Team | null; locale: string; align: "start" | "end" }) {
  const isHome = align === "start";
  const flag = team ? (
    <Image src={team.flag_url} alt="" width={64} height={44} sizes="64px" className="h-7 w-10 shrink-0 rounded-xs object-cover shadow-sm sm:h-11 sm:w-16" />
  ) : (
    <div className="h-7 w-10 shrink-0 rounded-xs bg-foreground/10 sm:h-11 sm:w-16" />
  );

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", isHome ? "flex-row" : "flex-row-reverse")}>
      {flag}
      <div className={cn("flex min-w-0 flex-col leading-tight", isHome ? "items-start text-left" : "items-end text-right")}>
        <span className="max-w-full truncate text-sm font-semibold sm:text-base">{team ? getTeamName(team, locale) : "TBD"}</span>
        <span className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">{team?.fifa_code ?? "—"}</span>
      </div>
    </div>
  );
}

function CenterScore({
  result,
  vsLabel,
  penaltiesText,
  yourRow,
}: {
  result: MatchResult | null;
  vsLabel: string;
  penaltiesText: string | null;
  yourRow: MemberPickRow | null;
}) {
  const tCard = useTranslations("schedule.card");

  return (
    <div className="flex flex-col items-center gap-1.5">
      {result ? (
        <span className="flex items-center gap-1.5 font-heading text-2xl font-bold tabular-nums sm:text-4xl">
          <span>{result.home_score}</span>
          <span className="text-xl text-muted-foreground sm:text-3xl">&minus;</span>
          <span>{result.away_score}</span>
        </span>
      ) : (
        <span className="font-heading text-xl font-bold tracking-wide text-muted-foreground uppercase">{vsLabel}</span>
      )}
      {penaltiesText ? <span className="text-2xs font-medium text-muted-foreground tabular-nums">{penaltiesText}</span> : null}

      {yourRow?.pick ? (
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {tCard("yourPick")}:{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {yourRow.pick.home_score} - {yourRow.pick.away_score}
          </span>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">{tCard("noPickMade")}</span>
      )}
    </div>
  );
}
