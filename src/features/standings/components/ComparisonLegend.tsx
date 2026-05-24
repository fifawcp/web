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
        <ul className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <li className="flex items-center gap-2">
            <AccuracyPill accuracy="exact_3pts" content="1" />
            {t("exact3pts")}
          </li>
          <li className="flex items-center gap-2">
            <AccuracyPill accuracy="top2_1pt" content="1" />
            {t("top21pt")}
          </li>
          <li className="flex items-center gap-2">
            <AccuracyPill accuracy="wrong_0pts" content="1" />
            {t("wrong0pts")}
          </li>
          <li className="flex items-center gap-2">
            <AccuracyPill accuracy="not_picked" content="—" />
            {t("notPicked")}
          </li>
        </ul>
      </div>
    </section>
  );
}
