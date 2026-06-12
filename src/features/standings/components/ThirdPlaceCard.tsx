"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import { computeThirdPlaceAccuracy } from "../lib/comparison";
import type { ThirdPlaceStandings } from "../types/standings.types";

import { ThirdPlaceRow } from "./ThirdPlaceRow";
import { ThirdsLegend } from "./ThirdsLegend";

type Props = {
  standings: ThirdPlaceStandings;
  /** FIFA codes the user picked as best thirds. Null hides the comparison column. */
  bestThirds: Set<string> | null;
};

const numHeader = "px-1.5 py-2 text-center text-2xs font-medium uppercase tracking-wider text-muted-foreground";

/**
 * Cross-group ranking of every third-placed team. The top eight advance to the
 * Round of 32; in compare mode a "Pick" column scores them against the user's
 * best-thirds selections.
 */
export function ThirdPlaceCard({ standings, bestThirds }: Props) {
  const t = useTranslations("standings.thirdPlace");
  const tCol = useTranslations("standings.columns");
  const tAria = useTranslations("standings.columnLabels");
  const showComparison = bestThirds !== null;
  const accuracy = showComparison ? computeThirdPlaceAccuracy(standings.rows, bestThirds) : null;
  const summary = accuracy && accuracy.total > 0 ? { earned: accuracy.points, possible: accuracy.maxPoints } : undefined;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("title")}</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("description")}</p>
      </div>

      {showComparison && <ThirdsLegend summary={summary} />}

      <article className="overflow-hidden rounded-xl border border-border bg-card" aria-label={t("title")}>
        {/* Same `table-fixed` + width strategy as GroupTable so columns
            never shift when a long team name shows up. */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th aria-hidden className="w-1 p-0" />
                <th scope="col" className="w-8 px-2 py-2 text-left text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("rank")}
                </th>
                <th scope="col" className="py-2 pr-2 text-left text-2xs font-medium uppercase tracking-wider text-muted-foreground">
                  {tCol("team")}
                </th>
                <th scope="col" className={cn(numHeader, "w-8")} aria-label={tAria("played")}>
                  {tCol("played")}
                </th>
                <th scope="col" className={cn(numHeader, "w-8", showComparison && "hidden sm:table-cell")} aria-label={tAria("won")}>
                  {tCol("won")}
                </th>
                <th scope="col" className={cn(numHeader, "w-8", showComparison && "hidden sm:table-cell")} aria-label={tAria("drawn")}>
                  {tCol("drawn")}
                </th>
                <th scope="col" className={cn(numHeader, "w-8", showComparison && "hidden sm:table-cell")} aria-label={tAria("lost")}>
                  {tCol("lost")}
                </th>
                <th scope="col" className={cn(numHeader, "hidden w-12 md:table-cell")} aria-label={tAria("goalsForAgainst")}>
                  {tCol("goalsForAgainst")}
                </th>
                <th scope="col" className={cn(numHeader, "w-8 sm:w-10")} aria-label={tAria("goalDifference")}>
                  {tCol("goalDifference")}
                </th>
                <th
                  scope="col"
                  className={cn(
                    "w-8 px-2 py-2 text-2xs font-medium uppercase tracking-wider text-muted-foreground sm:w-10",
                    showComparison ? "text-center" : "text-right"
                  )}
                  aria-label={tAria("points")}
                >
                  {tCol("points")}
                </th>
                {showComparison && (
                  <th scope="col" className={cn(numHeader, "w-8 sm:w-10")} aria-label={t("yourPickLabel")}>
                    {t("yourPick")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {standings.rows.map((row) => (
                <ThirdPlaceRow key={row.team.fifa_code} row={row} bestThirds={bestThirds} cutLine={row.third_place_rank === standings.qualifying_slots + 1} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-3 text-2xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-page-accent" />
            {t("advancesLegend", { count: standings.qualifying_slots })}
          </span>
        </div>
      </article>
    </section>
  );
}
