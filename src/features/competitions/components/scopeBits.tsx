"use client";

import Image from "next/image";
import { useLocale } from "next-intl";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

export function TeamFlag({ code, team }: { code: string; team: Team | undefined }) {
  if (!team?.flag_url) {
    return <span className="inline-flex shrink-0 items-center rounded-xs bg-muted px-1 text-2xs font-semibold text-foreground">{code}</span>;
  }
  return <Image src={team.flag_url} alt={code} title={code} width={20} height={14} className="h-3.5 w-5 shrink-0 rounded-xs object-cover" />;
}

// Overlapping flag stack (à la AvatarStack) with a +N overflow chip. Hovering the stack reveals a
// tooltip listing every country, so the full set stays glanceable without reflowing the card.
export function FlagStack({ teamCodes, teamsByCode, max = 6 }: { teamCodes: string[]; teamsByCode: Map<string, Team>; max?: number }) {
  const locale = useLocale();
  const shown = teamCodes.slice(0, max);
  const rest = teamCodes.length - shown.length;
  const allNames = teamCodes.map((c) => (teamsByCode.get(c) ? getTeamName(teamsByCode.get(c)!, locale) : c)).join(", ");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex w-fit items-center">
          {shown.map((code, i) => {
            const team = teamsByCode.get(code);
            return (
              <span key={code} className={cn("inline-block shrink-0 overflow-hidden rounded-xs", i > 0 && "-ml-1")} style={{ zIndex: shown.length - i }}>
                {team?.flag_url ? (
                  <Image src={team.flag_url} alt={code} width={20} height={14} className="h-3.5 w-5 object-cover" />
                ) : (
                  <span className="grid h-3.5 w-5 place-items-center bg-card text-[0.5rem] font-semibold text-foreground">{code}</span>
                )}
              </span>
            );
          })}
          {rest > 0 ? (
            <span className="ml-1 grid h-3.5 min-w-5 place-items-center rounded-xs bg-card px-1 text-[0.55rem] font-semibold text-muted-foreground ring-1 ring-border">
              +{rest}
            </span>
          ) : null}
        </div>
      </TooltipTrigger>
      <TooltipContent>{allNames}</TooltipContent>
    </Tooltip>
  );
}
