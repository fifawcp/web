"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import type { GroupStandings } from "../types/standings.types";

import { TeamRow } from "./TeamRow";

type Props = {
  rows: GroupStandings["rows"];
  groupPicks: Map<string, number> | null;
};

const numHeader = "px-1.5 py-2 text-center text-2xs font-medium uppercase tracking-wider text-muted-foreground";

export function GroupTable({ rows, groupPicks }: Props) {
  const t = useTranslations("standings.columns");
  const aria = useTranslations("standings.columnLabels");
  const showComparison = groupPicks !== null;

  // `table-fixed` + explicit column widths keep every group's columns aligned
  // at the same x-position regardless of team name length; long names
  // truncate via `TeamRow`.
  return (
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr className="border-b border-border">
          <th aria-hidden className="w-1 p-0" />
          <th scope="col" className="w-8 px-2 py-2 text-left text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            #
          </th>
          <th scope="col" className="py-2 pr-2 text-left text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("team")}
          </th>
          <th scope="col" className={cn(numHeader, "w-8")} aria-label={aria("played")}>
            {t("played")}
          </th>
          <th scope="col" className={cn(numHeader, "w-8", showComparison && "hidden sm:table-cell")} aria-label={aria("won")}>
            {t("won")}
          </th>
          <th scope="col" className={cn(numHeader, "w-8", showComparison && "hidden sm:table-cell")} aria-label={aria("drawn")}>
            {t("drawn")}
          </th>
          <th scope="col" className={cn(numHeader, "w-8", showComparison && "hidden sm:table-cell")} aria-label={aria("lost")}>
            {t("lost")}
          </th>
          <th scope="col" className={cn(numHeader, "hidden w-12 md:table-cell")} aria-label={aria("goalsForAgainst")}>
            {t("goalsForAgainst")}
          </th>
          <th scope="col" className={cn(numHeader, "w-8 sm:w-10")} aria-label={aria("goalDifference")}>
            {t("goalDifference")}
          </th>
          <th
            scope="col"
            className={cn("w-8 px-2 py-2 text-2xs font-medium uppercase tracking-wider text-muted-foreground sm:w-10", showComparison ? "text-center" : "text-right")}
            aria-label={aria("points")}
          >
            {t("points")}
          </th>
          {showComparison && (
            <th scope="col" className={cn(numHeader, "w-8 sm:w-10")} aria-label={aria("you")}>
              {t("you")}
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <TeamRow key={row.team.fifa_code} row={row} groupPicks={groupPicks} />
        ))}
      </tbody>
    </table>
  );
}
