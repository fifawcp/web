"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { BracketDesktop } from "@/features/pickems/components/BracketDesktop";
import { BracketMobile } from "@/features/pickems/components/BracketMobile";
import { findChampion, projectBracket } from "@/features/pickems/lib/projectBracket";
import type { BracketStageCode, UserPickem } from "@/features/pickems/types/pickems.types";
import { useMatches } from "@/features/schedule/hooks/useMatches";
import type { Match } from "@/features/schedule/types/schedule.types";
import { cn } from "@/shared/lib/utils";

import { useBracketCompareView } from "../hooks/useBracketCompareView";
import { buildComparisonMap, summarizeBracket } from "../lib/bracketCompare";
import { buildActualBracket } from "../lib/buildActualBracket";
import type { MockBracketData } from "../lib/devMock";

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

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Guest-accessible bracket page.
 *   - "Results" (default, everyone): the real knockout tree from `/matches`,
 *     filling in as matches finish.
 *   - "Compare" (signed-in with a pickem): the user's predicted tree from
 *     `/pickems`, with teams they correctly sent through each round highlighted
 *     green and an earned / possible points tally.
 *
 * In development a "Mock" toggle swaps in fake results (and a fake prediction
 * when not signed in) so Compare can be exercised before real knockout results
 * exist. The mock module is dynamically imported, so it never loads in prod.
 */
export function BracketView({ initialMatches, initialPickem, isAuthed }: Props) {
  const t = useTranslations("bracket");
  const { data: matches = initialMatches } = useMatches(initialMatches);

  // --- Dev-only mock data (lazy-loaded once, then cached; never bundled into
  // the prod path). `mock` gates the cached data on the toggle so we never have
  // to synchronously reset state in the effect. ---
  const [mockOn, setMockOn] = useState(false);
  const [mockData, setMockData] = useState<MockBracketData | null>(null);

  useEffect(() => {
    if (!IS_DEV || !mockOn || mockData) return;
    let active = true;
    void import("../lib/devMock").then((m) => {
      if (active) setMockData(m.buildMockBracketData());
    });
    return () => {
      active = false;
    };
  }, [mockOn, mockData]);

  const mock = mockOn ? mockData : null;

  // Actual tree from match results (or mock); predicted tree projected from the
  // user's committed picks (R16+ home/away resolve from each slot's picked_team).
  const realActual = useMemo(() => buildActualBracket(matches), [matches]);
  const realPredicted = useMemo(() => (initialPickem ? projectBracket(initialPickem.bracket, NO_DRAFT) : null), [initialPickem]);

  const actualSlots = mock ? mock.actual : realActual;
  const predictedSlots = mock ? (realPredicted ?? mock.predicted) : realPredicted;

  // `mockOn` (intent) gates compare immediately, before the mock chunk resolves.
  const canCompare = (isAuthed && realPredicted !== null) || mockOn;
  const [view, setView] = useBracketCompareView(canCompare);
  const comparing = view === "compare" && predictedSlots !== null;

  const toggleMock = useCallback(
    (next: boolean) => {
      setMockOn(next);
      setView(next ? "compare" : "results");
    },
    [setView]
  );

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
          <div className="flex items-center gap-2">
            {IS_DEV && (
              <button
                type="button"
                onClick={() => toggleMock(!mockOn)}
                className={cn(
                  "rounded-md border border-dashed px-2.5 py-1 font-mono text-2xs uppercase tracking-wider transition-colors",
                  mockOn ? "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-400" : "border-border text-muted-foreground hover:bg-muted"
                )}
                title="Dev only: swap in mock results to test Compare"
              >
                {mockOn ? "Mock: on" : "Mock: off"}
              </button>
            )}
            {canCompare && <CompareToggle view={view} onChange={setView} />}
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{comparing ? t("descriptionCompare") : t("description")}</p>
      </header>

      {comparing && summary && summary.possible > 0 && <BracketCompareLegend summary={summary} />}

      <BracketDesktop bracket={actualSlots} champion={champion} disabled comparisonById={comparisonById} />
      <BracketMobile bracket={actualSlots} champion={champion} disabled comparisonById={comparisonById} activeStage={activeStage} onStageChange={goToStage} />
    </div>
  );
}
