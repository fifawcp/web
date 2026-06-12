"use client";

import { useTranslations } from "next-intl";

import { ScoreTally } from "@/shared/components/ScoreTally";
import { cn } from "@/shared/lib/utils";

import { getThirdPlacePillClass } from "../lib/comparison";
import type { ThirdPlaceAccuracy } from "../types/standings.types";

const pillBase = "inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-2xs font-semibold tabular-nums";

function ThirdsPill({ accuracy, content }: { accuracy: ThirdPlaceAccuracy; content: string }) {
  return <span className={cn(pillBase, getThirdPlacePillClass(accuracy))}>{content}</span>;
}

/**
 * Legend for the best-thirds comparison. Sits above the ThirdPlaceCard so the
 * meaning of the You column is right next to the table that uses it. Mirrors
 * the structure of `ComparisonLegend` for the group tables.
 */
type Props = {
  /** Best-thirds earned / possible points. Omitted → the figure is hidden. */
  summary?: { earned: number; possible: number };
};

export function ThirdsLegend({ summary }: Props) {
  const t = useTranslations("standings.thirdsLegend");
  const tScore = useTranslations("standings.score");

  return (
    <section aria-label={t("title")} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("title")}</p>
        {summary ? <ScoreTally earned={summary.earned} possible={summary.possible} pointsLabel={tScore("pointsLabel")} caption={tScore("earnedPossible")} /> : null}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-foreground">
          {t("youColumn")} <span className="font-normal text-muted-foreground">— {t("youColumnHelp")}</span>
        </p>
        <ul className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
          <li className="flex items-center gap-2">
            <ThirdsPill accuracy="correct" content="✓" />
            {t("correct")}
          </li>
          <li className="flex items-center gap-2">
            <ThirdsPill accuracy="wrong" content="✕" />
            {t("wrong")}
          </li>
          <li className="flex items-center gap-2">
            <ThirdsPill accuracy="not_picked" content="—" />
            {t("notPicked")}
          </li>
        </ul>
      </div>
    </section>
  );
}
