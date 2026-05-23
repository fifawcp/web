"use client";

import Image from "next/image";
import { useLocale } from "next-intl";

import { cn } from "@/shared/lib/utils";

import { computeRowComparison, getAccuracyPillClass } from "../lib/comparison";
import { getQualificationBarClass } from "../lib/qualificationStyles";
import type { TeamStandingRow } from "../types/standings.types";

type Props = {
  row: TeamStandingRow;
  /** Predicted positions for this row's group. Null disables the comparison cells. */
  groupPicks: Map<string, number> | null;
};

const numCell = "px-1.5 py-2.5 text-center text-sm tabular-nums";

export function TeamRow({ row, groupPicks }: Props) {
  const locale = useLocale();
  const teamName = row.team.name[locale] ?? row.team.name.en ?? row.team.fifa_code;
  const barClass = getQualificationBarClass(row.qualification_status);
  const gd = row.goal_difference;
  const comparison = groupPicks ? computeRowComparison(row, groupPicks) : null;
  const showComparison = comparison !== null;
  // In compare mode on small screens, drop W/D/L so the YOU/Δ pair has room
  // to breathe. PTS centres to align with the YOU/Δ columns next to it.
  const hideOnMobileCompare = cn(numCell, showComparison && "hidden sm:table-cell");

  return (
    <tr className="border-t border-border first:border-t-0">
      <td aria-hidden className={cn("w-1 p-0", barClass)} />
      <td className="px-2 py-2.5 text-xs tabular-nums text-muted-foreground">{row.position}</td>
      <td className="py-2.5 pr-2">
        <div className="flex min-w-0 items-center gap-2">
          <Image src={row.team.flag_url} alt="" width={20} height={14} className="h-3.5 w-5 shrink-0 rounded-xs object-cover" unoptimized />
          <span className="min-w-0 truncate text-sm font-medium">{teamName}</span>
          <span className="hidden shrink-0 text-2xs text-muted-foreground sm:inline">{row.team.fifa_code}</span>
        </div>
      </td>
      <td className={numCell}>{row.matches_played}</td>
      <td className={hideOnMobileCompare}>{row.wins}</td>
      <td className={hideOnMobileCompare}>{row.draws}</td>
      <td className={hideOnMobileCompare}>{row.losses}</td>
      <td className={cn(numCell, "hidden text-muted-foreground md:table-cell")}>
        {row.goals_for}:{row.goals_against}
      </td>
      <td className={numCell}>{gd > 0 ? `+${gd}` : gd}</td>
      <td className={cn("px-2 py-2.5 text-sm font-semibold tabular-nums", showComparison ? "text-center" : "text-right")}>{row.points}</td>
      {comparison && (
        <td className="px-2 py-2.5 text-center">
          <span
            className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-2xs font-semibold tabular-nums",
              getAccuracyPillClass(comparison.accuracy)
            )}
          >
            {comparison.predicted_position ?? "—"}
          </span>
        </td>
      )}
    </tr>
  );
}
