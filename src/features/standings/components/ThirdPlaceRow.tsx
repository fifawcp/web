"use client";

import Image from "next/image";
import { useLocale } from "next-intl";

import { cn } from "@/shared/lib/utils";

import { computeThirdPlaceComparison, getThirdPlacePillClass } from "../lib/comparison";
import type { ThirdPlaceRow as ThirdPlaceRowData } from "../types/standings.types";

type Props = {
  row: ThirdPlaceRowData;
  /** FIFA codes the user picked as best thirds. Null disables the comparison cell. */
  bestThirds: Set<string> | null;
  /** True for the first non-qualifying row — draws the playoff cut line. */
  cutLine: boolean;
};

const numCell = "px-1.5 py-2.5 text-center text-sm tabular-nums";

export function ThirdPlaceRow({ row, bestThirds, cutLine }: Props) {
  const locale = useLocale();
  const teamName = row.team.name[locale] ?? row.team.name.en ?? row.team.fifa_code;
  const gd = row.goal_difference;
  const comparison = bestThirds ? computeThirdPlaceComparison(row, bestThirds) : null;
  const showComparison = comparison !== null;

  return (
    <tr
      className={cn(
        "border-t border-border first:border-t-0",
        cutLine && "border-t-2 border-dashed border-muted-foreground/40",
        !row.advances && "bg-muted/40 text-muted-foreground"
      )}
    >
      <td aria-hidden className={cn("w-1 p-0", row.advances ? "bg-page-accent" : "bg-transparent")} />
      <td className={cn("px-2 py-2.5 text-xs font-semibold tabular-nums", row.advances && "text-page-accent")}>{row.third_place_rank}</td>
      <td className="py-2.5 pr-2">
        <div className="flex min-w-0 items-center gap-2">
          <Image src={row.team.flag_url} alt="" width={20} height={14} className="h-3.5 w-5 shrink-0 rounded-xs object-cover" unoptimized />
          <span className="min-w-0 truncate text-sm font-medium text-foreground">{teamName}</span>
          <span className="hidden shrink-0 text-2xs font-medium text-muted-foreground sm:inline">{row.team.group_code}</span>
        </div>
      </td>
      <td className={numCell}>{row.matches_played}</td>
      <td className={cn(numCell, showComparison && "hidden sm:table-cell")}>{row.wins}</td>
      <td className={cn(numCell, showComparison && "hidden sm:table-cell")}>{row.draws}</td>
      <td className={cn(numCell, showComparison && "hidden sm:table-cell")}>{row.losses}</td>
      <td className={cn(numCell, "hidden text-muted-foreground md:table-cell")}>
        {row.goals_for}:{row.goals_against}
      </td>
      <td className={numCell}>{gd > 0 ? `+${gd}` : gd}</td>
      <td className={cn("px-2 py-2.5 text-sm font-semibold tabular-nums text-foreground", showComparison ? "text-center" : "text-right")}>{row.points}</td>
      {comparison && (
        <td className="px-2 py-2.5 text-center">
          <span
            className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-2xs font-semibold",
              getThirdPlacePillClass(comparison.accuracy)
            )}
          >
            {comparison.picked ? (comparison.accuracy === "correct" ? "✓" : "✕") : "—"}
          </span>
        </td>
      )}
    </tr>
  );
}
