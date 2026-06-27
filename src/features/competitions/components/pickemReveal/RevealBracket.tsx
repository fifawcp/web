"use client";

import { useMemo } from "react";

import { BracketCompareLegend } from "@/features/bracket/components/BracketCompareLegend";
import { summarizeBracket } from "@/features/bracket/lib/bracketCompare";
import { buildActualBracket } from "@/features/bracket/lib/buildActualBracket";
import { BracketTree } from "@/features/pickems/components/BracketTree";
import { findChampion, projectBracket } from "@/features/pickems/lib/projectBracket";
import type { BracketMatchSlot } from "@/features/pickems/types/pickems.types";
import type { Match } from "@/features/schedule/types/schedule.types";

import { buildBracketReveal } from "../../lib/pickemRevealCompare";

type Props = {
  bracket: BracketMatchSlot[];
  // Live match results the member's bracket is scored against.
  matches: Match[];
  // Whether the member actually played (any board points). The seeded member
  // endpoint hands back a default tree even for non-players, so we only green a
  // member's picks once they've earned something — otherwise nothing lights up.
  participated: boolean;
};

// No local draft — the member's committed picks already live on each slot's
// `picked_team`; projection only resolves R16+ home/away forward from them.
const NO_DRAFT = {};

/**
 * The member's *predicted* knockout tree — their actual picks — reusing the same
 * `BracketTree` that `/bracket` and `/pickems` step 3 render. Each team greens when
 * the member correctly predicted it to reach that round — including the Round of
 * 32, which confirms the group call even though it scores no bracket points. The
 * earned / possible points legend (points are for advancing) sits on top.
 */
export function RevealBracket({ bracket, matches, participated }: Props) {
  const predictedSlots = useMemo(() => projectBracket(bracket, NO_DRAFT), [bracket]);
  const actualSlots = useMemo(() => buildActualBracket(matches), [matches]);

  // Keyed on the member's tree: greens the picks they got right. All-false for a
  // non-player, which keeps the cards in compare mode (no pick accent, no checks).
  const comparisonById = useMemo(() => buildBracketReveal(predictedSlots, actualSlots, participated), [predictedSlots, actualSlots, participated]);
  const champion = useMemo(() => findChampion(predictedSlots), [predictedSlots]);

  // Earned/possible tally; a non-player earns nothing, so zero it while keeping the
  // attainable total (the legend hides the tally entirely until results land).
  const summary = useMemo(() => {
    const raw = summarizeBracket(actualSlots, predictedSlots);
    return participated ? raw : { earned: 0, possible: raw.possible };
  }, [participated, actualSlots, predictedSlots]);

  return (
    <div className="flex flex-col gap-4">
      <BracketCompareLegend summary={summary} />
      <BracketTree bracket={predictedSlots} champion={champion} disabled comparisonById={comparisonById} />
    </div>
  );
}
