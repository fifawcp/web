"use client";

import { useCallback, useMemo, useState } from "react";
import { SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";

import { BracketDesktop } from "@/features/pickems/components/BracketDesktop";
import { BracketMobile } from "@/features/pickems/components/BracketMobile";
import { findChampion, projectBracket } from "@/features/pickems/lib/projectBracket";
import type { BracketStageCode, UserPickem } from "@/features/pickems/types/pickems.types";
import { useMatches } from "@/features/schedule/hooks/useMatches";
import type { Match } from "@/features/schedule/types/schedule.types";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";

import { useBracketCompareView } from "../hooks/useBracketCompareView";
import { buildComparisonMap, summarizeBracket } from "../lib/bracketCompare";
import { buildActualBracket } from "../lib/buildActualBracket";

import { BracketCompareLegend } from "./BracketCompareLegend";
import { CompareToggle } from "./CompareToggle";

type Props = {
  initialMatches: Match[];
  /** The user's pickem, or null for guests. Source of the compare predictions. */
  initialPickem: UserPickem | null;
  isAuthed: boolean;
};

// Stable empty draft — the committed picks already live on each slot's
// `picked_team`, so projection only needs to resolve R16+ home/away forward.
const NO_DRAFT = {};

/**
 * Guest-accessible bracket page.
 *   - "Results" (default, everyone): the real knockout tree from `/matches`,
 *     filling in as matches finish.
 *   - "Compare" (signed-in with a pickem): the real bracket with the teams the
 *     user correctly predicted to reach each round highlighted green, plus an
 *     earned / possible points tally.
 */
export function BracketView({ initialMatches, initialPickem, isAuthed }: Props) {
  const t = useTranslations("bracket");
  const { data: matches = initialMatches } = useMatches(initialMatches);

  // Actual tree from match results; predicted tree projected from the user's
  // committed picks (R16+ home/away resolve from each slot's picked_team).
  const actualSlots = useMemo(() => buildActualBracket(matches), [matches]);
  const predictedSlots = useMemo(() => (initialPickem ? projectBracket(initialPickem.bracket, NO_DRAFT) : null), [initialPickem]);

  const canCompare = isAuthed && predictedSlots !== null;
  const [view, setView] = useBracketCompareView(canCompare);
  const comparing = view === "compare" && predictedSlots !== null;

  const [activeStage, setActiveStage] = useState<BracketStageCode>("round_of_32");
  const goToStage = useCallback((stage: BracketStageCode) => {
    setActiveStage(stage);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Both views render the real bracket; compare just overlays green checks on
  // the teams the user predicted correctly + the earned/possible tally.
  const champion = useMemo(() => findChampion(actualSlots), [actualSlots]);
  const comparisonById = useMemo(
    () => (comparing && predictedSlots ? buildComparisonMap(actualSlots, predictedSlots) : undefined),
    [comparing, predictedSlots, actualSlots]
  );
  const summary = useMemo(() => (comparing && predictedSlots ? summarizeBracket(actualSlots, predictedSlots) : null), [comparing, predictedSlots, actualSlots]);

  // Any settled knockout match flips the eyebrow to its "live" wording.
  const hasResults = useMemo(() => actualSlots.some((s) => s.picked_team !== null), [actualSlots]);

  return (
    <div className="container mx-auto flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            <span aria-hidden className="size-1.5 rounded-full bg-page-accent" />
            {hasResults ? t("stageHeadingLive") : t("stageHeading")}
          </span>
          {canCompare && <CompareToggle view={view} onChange={setView} />}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
          {isAuthed && (
            <Button asChild variant="outline" size="sm" className="shrink-0 self-start sm:self-auto">
              <Link href="/pickems?step=bracket">
                <SquarePen className="size-4" />
                {t("seeMyPicks")}
              </Link>
            </Button>
          )}
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{comparing ? t("descriptionCompare") : t("description")}</p>
      </header>

      {comparing && summary && summary.possible > 0 && <BracketCompareLegend summary={summary} />}

      <BracketDesktop bracket={actualSlots} champion={champion} disabled comparisonById={comparisonById} />
      <BracketMobile bracket={actualSlots} champion={champion} disabled comparisonById={comparisonById} activeStage={activeStage} onStageChange={goToStage} />
    </div>
  );
}
