import type { ReactNode } from "react";
import Image from "next/image";

import type { Match } from "@/features/schedule/types/schedule.types";

type Props = {
  match: Match;
  // The scoreline rendered between the two team codes (a predicted score, result, or "vs").
  score: ReactNode;
};

// Compact "flag CODE score CODE flag" row used by the desktop reveal preview.
export function InlineMatchTeams({ match, score }: Props) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
      <TeamFlag team={match.teams.home} />
      <span className="font-medium text-foreground">{match.teams.home?.fifa_code ?? "—"}</span>
      {score}
      <span className="font-medium text-foreground">{match.teams.away?.fifa_code ?? "—"}</span>
      <TeamFlag team={match.teams.away} />
    </div>
  );
}

function TeamFlag({ team }: { team: Match["teams"]["home"] }) {
  if (!team) return <span className="h-4 w-6 shrink-0 rounded-xs bg-foreground/10" />;
  return <Image src={team.flag_url} alt="" width={24} height={16} sizes="24px" className="h-4 w-6 shrink-0 rounded-xs object-cover" />;
}
