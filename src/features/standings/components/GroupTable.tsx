import { getLocale, getTranslations } from "next-intl/server";

import { cn } from "@/shared/lib/utils";

import type { GroupStandings } from "../types/standings.types";

import { TeamRow } from "./TeamRow";

type Props = {
  rows: GroupStandings["rows"];
  groupPicks: Map<string, number> | null;
};

const numHeader = "px-1.5 py-2 text-center text-2xs font-medium uppercase tracking-wider text-muted-foreground";

export async function GroupTable({ rows, groupPicks }: Props) {
  const t = await getTranslations("standings.columns");
  const aria = await getTranslations("standings.columnLabels");
  const locale = await getLocale();
  const showComparison = groupPicks !== null;

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-border">
          <th aria-hidden className="w-1 p-0" />
          <th scope="col" className="px-2 py-2 text-left text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            #
          </th>
          <th scope="col" className="py-2 pr-2 text-left text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("team")}
          </th>
          <th scope="col" className={numHeader} aria-label={aria("played")}>
            {t("played")}
          </th>
          <th scope="col" className={numHeader} aria-label={aria("won")}>
            {t("won")}
          </th>
          <th scope="col" className={numHeader} aria-label={aria("drawn")}>
            {t("drawn")}
          </th>
          <th scope="col" className={numHeader} aria-label={aria("lost")}>
            {t("lost")}
          </th>
          <th scope="col" className={cn(numHeader, "hidden md:table-cell")} aria-label={aria("goalsForAgainst")}>
            {t("goalsForAgainst")}
          </th>
          <th scope="col" className={numHeader} aria-label={aria("goalDifference")}>
            {t("goalDifference")}
          </th>
          <th scope="col" className="px-2 py-2 text-right text-2xs font-medium uppercase tracking-wider text-muted-foreground" aria-label={aria("points")}>
            {t("points")}
          </th>
          {showComparison && (
            <>
              <th scope="col" className={numHeader} aria-label={aria("you")}>
                {t("you")}
              </th>
              <th scope="col" className={numHeader} aria-label={aria("delta")}>
                {t("delta")}
              </th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <TeamRow key={row.team.fifa_code} row={row} locale={locale} groupPicks={groupPicks} />
        ))}
      </tbody>
    </table>
  );
}
