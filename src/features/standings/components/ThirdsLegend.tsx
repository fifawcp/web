"use client";

import { useTranslations } from "next-intl";

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
export function ThirdsLegend() {
  const t = useTranslations("standings.thirdsLegend");

  return (
    <section aria-label={t("title")} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("title")}</p>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-foreground">
          {t("youColumn")} <span className="font-normal text-muted-foreground">— {t("youColumnHelp")}</span>
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <ThirdsPill accuracy="correct" content="✓" />
            {t("correct")}
          </li>
          <li className="flex items-center gap-2">
            <ThirdsPill accuracy="wrong" content="✓" />
            {t("wrong")}
          </li>
          <li className="flex items-center gap-2">
            <ThirdsPill accuracy="missed" content="✕" />
            {t("missed")}
          </li>
          <li className="flex items-center gap-2">
            <ThirdsPill accuracy="not_picked" content="—" />
            {t("notPicked")}
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <p className="text-xs font-semibold text-foreground">{t("scoringTitle")}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="inline-block w-5 text-center font-bold tabular-nums text-foreground">+2</span>
            {t("scoreCorrect")}
          </li>
        </ul>
      </div>
    </section>
  );
}
