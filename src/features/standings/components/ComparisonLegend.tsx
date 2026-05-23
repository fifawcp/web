"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import { getAccuracyPillClass } from "../lib/comparison";
import type { PickAccuracy } from "../types/standings.types";

const pillBase = "inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-2xs font-semibold tabular-nums";

function AccuracyPill({ accuracy, content }: { accuracy: PickAccuracy; content: string }) {
  return <span className={cn(pillBase, getAccuracyPillClass(accuracy))}>{content}</span>;
}

/**
 * Legend for the group-stage compare view.
 *
 * The pill colours describe how close the pick was — nothing more. The
 * points formula is its own block so users don't mistake "yellow pill" for
 * "+1 point": amber means off-by-1, and the +1 bonus only kicks in for a
 * top-2 swap. Keeping the two ideas apart was the whole reason we split
 * the legend in two.
 */
export function ComparisonLegend() {
  const t = useTranslations("standings.comparisonLegend");

  return (
    <section aria-label={t("title")} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("title")}</p>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-foreground">
          {t("youColumn")} <span className="font-normal text-muted-foreground">— {t("youColumnHelp")}</span>
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <AccuracyPill accuracy="exact" content="1" />
            {t("exact")}
          </li>
          <li className="flex items-center gap-2">
            <AccuracyPill accuracy="off_by_1" content="1" />
            {t("offBy1")}
          </li>
          <li className="flex items-center gap-2">
            <AccuracyPill accuracy="off_by_2_plus" content="1" />
            {t("offBy2Plus")}
          </li>
          <li className="flex items-center gap-2">
            <AccuracyPill accuracy="not_picked" content="—" />
            {t("notPicked")}
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <p className="text-xs font-semibold text-foreground">{t("scoringTitle")}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="inline-block w-5 text-center font-bold tabular-nums text-foreground">+3</span>
            {t("scoreExact")}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block w-5 text-center font-bold tabular-nums text-foreground">+1</span>
            {t("scoreTop2")}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="inline-block w-5 text-center font-bold tabular-nums text-foreground">0</span>
            {t("scoreOther")}
          </li>
        </ul>
      </div>
    </section>
  );
}
