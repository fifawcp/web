import type { ReactNode } from "react";
import Image from "next/image";

import type { Match } from "@/features/schedule/types/schedule.types";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

type Props = {
  match: Match;
  // The scoreline rendered in the centre column (a result, a member's pick, or "vs").
  score: ReactNode;
  locale: string;
  className?: string;
};

// Two-line team row — flag · (name over code) · score · (name over code) · flag.
// Equal flex text columns keep the centre score aligned across stacked rows; names
// hug their flag (home left, away right). Shared by the board reveal list and the
// member predictions dialog.
export function StackedMatchTeams({ match, score, locale, className }: Props) {
  return (
    <div className={cn("grid flex-1 grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-x-2", className)}>
      <TeamFlag team={match.teams.home} />
      <TeamText team={match.teams.home} align="start" locale={locale} />
      <div className="flex justify-center">{score}</div>
      <TeamText team={match.teams.away} align="end" locale={locale} />
      <TeamFlag team={match.teams.away} />
    </div>
  );
}

function TeamText({ team, align, locale }: { team: Team | null; align: "start" | "end"; locale: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col leading-tight", align === "end" ? "items-end" : "items-start")}>
      <span className="max-w-full truncate text-sm font-medium text-foreground">{team ? getTeamName(team, locale) : "TBD"}</span>
      <span className="text-2xs font-medium tracking-wide text-muted-foreground uppercase">{team?.fifa_code ?? "—"}</span>
    </div>
  );
}

function TeamFlag({ team }: { team: Team | null }) {
  if (!team) return <span className="h-4 w-6 shrink-0 rounded-xs bg-foreground/10" />;
  return <Image src={team.flag_url} alt="" width={24} height={16} sizes="24px" className="h-4 w-6 shrink-0 rounded-xs object-cover" />;
}
