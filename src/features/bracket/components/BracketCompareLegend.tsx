"use client";

import { useTranslations } from "next-intl";

import type { BracketStageCode } from "@/features/pickems/types/pickems.types";

import { STAGE_POINTS } from "../lib/bracketCompare";
import type { BracketCompareSummary } from "../types/bracket.types";

type Props = {
  summary: BracketCompareSummary;
};

// Rounds in scoring order, rendered as compact chips. The reach rounds show the
// transition they reward — "R32 → R16 +4" — to make clear the points are for
// *winning* that round (advancing), not for reaching it. The third-place match
// and final are terminal (win the match), so they show a single label.
const SCORING_ORDER: BracketStageCode[] = ["round_of_32", "round_of_16", "quarterfinals", "semifinals", "third_place", "final"];

const NEXT_STAGE: Partial<Record<BracketStageCode, BracketStageCode>> = {
  round_of_32: "round_of_16",
  round_of_16: "quarterfinals",
  quarterfinals: "semifinals",
  semifinals: "final",
};

/**
 * Compare-mode legend: the running score up top, the green-check meaning, and a
 * row of per-round point chips (scannable, instead of a run-on sentence).
 */
export function BracketCompareLegend({ summary }: Props) {
  const t = useTranslations("bracket.legend");
  const tShort = useTranslations("pickems.bracket.roundsShort");
  const tBracket = useTranslations("pickems.bracket");

  // Winning the final means becoming champion — label it as the prize, not the round.
  const stageLabel = (stage: BracketStageCode) => (stage === "final" ? tBracket("champion") : tShort(stage));

  return (
    <section aria-label={t("title")} className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("title")}</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-3.5 shrink-0 rounded-xs border border-lime-500/50 bg-lime-500/20" />
              <span className="font-semibold text-foreground">{t("correct")}</span>
            </span>
            <span className="text-muted-foreground">{t("correctHelp")}</span>
          </p>
        </div>
        {/* No matches decided yet → the tally would read "0 / 0", so we drop it and
            leave just the scoring key until the first knockout result lands. */}
        {summary.possible > 0 && (
          <div className="flex shrink-0 flex-col items-end leading-none">
            <span className="flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-page-accent">{summary.earned}</span>
              <span className="text-sm tabular-nums text-muted-foreground">/ {summary.possible}</span>
              <span className="ml-0.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("pointsLabel")}</span>
            </span>
            <span className="mt-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("earnedPossible")}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("scoringTitle")}</p>
        <ul className="flex flex-wrap gap-1.5">
          {SCORING_ORDER.map((stage) => {
            const next = NEXT_STAGE[stage];
            return (
              <li key={stage} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2 py-1">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                  {stageLabel(stage)}
                  {next ? (
                    <>
                      <span aria-hidden className="text-muted-foreground">
                        →
                      </span>
                      {tShort(next)}
                    </>
                  ) : null}
                </span>
                <span className="font-mono text-xs font-semibold text-page-accent">+{STAGE_POINTS[stage]}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
