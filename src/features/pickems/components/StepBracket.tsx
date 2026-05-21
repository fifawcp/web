"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useBracketDraft } from "../hooks/useBracketDraft";
import { useSubmitBracket } from "../hooks/useSubmitBracket";
import { STAGE_MATCH_IDS, STAGES, TOTAL_BRACKET_PICKS } from "../lib/bracketStructure";
import { prevStep } from "../lib/pickemStep";
import { findChampion, projectBracket } from "../lib/projectBracket";
import type { BracketDraft, BracketStageCode, PickemProgress, PickemStep, UserPickem } from "../types/pickems.types";

import { BracketDesktop } from "./BracketDesktop";
import { BracketMobile } from "./BracketMobile";
import { PickemsCTABar, type CTAAction } from "./PickemsCTABar";
import { PickemsHeader } from "./PickemsHeader";
import { PickemsHeaderActions } from "./PickemsHeaderActions";
import { PickemsHeaderProgress } from "./PickemsHeaderProgress";
import { PickemsStepper } from "./PickemsStepper";

// Stable reference for "no local draft" — keeps useMemo cached when locked.
const EMPTY_DRAFT: BracketDraft = {};

type Props = {
  data: UserPickem;
  step: PickemStep;
  onStep: (step: PickemStep) => void;
  progress: PickemProgress;
  canNavigateTo: (step: PickemStep) => boolean;
  userId: string | undefined;
};

export function StepBracket({ data, step, onStep, progress, canNavigateTo, userId }: Props) {
  const t = useTranslations("pickems.bracket");
  const tRounds = useTranslations("pickems.bracket.rounds");
  const tCommon = useTranslations("pickems");
  const { draft: rawDraft, pick } = useBracketDraft(userId);
  const { submit, isSubmitting } = useSubmitBracket();
  // Active stage is owned here so the mobile CTA bar can react to it (per-stage
  // counter, "Next: <round>" button). BracketMobile reads + writes through props.
  const [activeStage, setActiveStage] = useState<BracketStageCode>("round_of_32");

  // When locked, ignore the local draft — only show what the user committed.
  const draft = data.is_locked ? EMPTY_DRAFT : rawDraft;

  const projected = useMemo(() => projectBracket(data.bracket, draft), [data.bracket, draft]);
  const champion = findChampion(projected);

  const pickedCount = projected.reduce((n, slot) => (slot.picked_team ? n + 1 : n), 0);
  const isReady = pickedCount === TOTAL_BRACKET_PICKS;

  const projectedById = useMemo(() => new Map(projected.map((slot) => [slot.match_id, slot] as const)), [projected]);
  const stageStats = useMemo(() => {
    const ids = STAGE_MATCH_IDS[activeStage];
    const completed = ids.reduce((n, id) => (projectedById.get(id)?.picked_team ? n + 1 : n), 0);
    return { total: ids.length, completed, remaining: ids.length - completed, isComplete: completed === ids.length };
  }, [activeStage, projectedById]);

  const stageIdx = STAGES.indexOf(activeStage);
  const nextStage = stageIdx >= 0 && stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1] : null;
  const prevStage = stageIdx > 0 ? STAGES[stageIdx - 1] : null;

  const prev = prevStep("bracket");
  const helperText = !isReady ? t("picksLeft", { n: TOTAL_BRACKET_PICKS - pickedCount }) : undefined;
  const desktopBack = !data.is_locked && prev ? () => onStep(prev) : undefined;
  // Mobile back walks the tabs leftward; once we're at R32, it falls through to
  // the step-level back (→ best thirds). Keeps the gesture meaning "previous"
  // whether that's a previous round or the previous step. When locked, we drop
  // the Back affordance entirely — the stepper is the only navigation.
  const mobileBack = data.is_locked ? undefined : prevStage ? () => setActiveStage(prevStage) : desktopBack;

  const desktopAction: CTAAction = data.is_locked
    ? { kind: "hidden" }
    : {
        kind: "submit",
        label: t("submit"),
        disabled: !isReady,
        loading: isSubmitting,
        helperText,
        onClick: () => submit(draft),
      };

  // Per-stage mobile CTA: a "Next: <round>" button gated on the current stage
  // being complete. Final stage flips to "Submit picks", which still requires
  // all 32 picks across the bracket (a user could land on Final via tab without
  // having completed earlier rounds).
  const mobileAction: CTAAction = data.is_locked
    ? { kind: "hidden" }
    : nextStage
      ? {
          kind: "continue",
          label: tRounds(nextStage),
          disabled: !stageStats.isComplete,
          helperText: stageStats.isComplete ? undefined : t("roundLeft", { n: stageStats.remaining }),
          onClick: () => setActiveStage(nextStage),
        }
      : {
          kind: "submit",
          label: t("submit"),
          disabled: !isReady,
          loading: isSubmitting,
          helperText,
          onClick: () => submit(draft),
        };

  const rightSlot = (
    <>
      <PickemsHeaderActions action={desktopAction} onBack={desktopBack} />
      <PickemsHeaderProgress completed={pickedCount} total={TOTAL_BRACKET_PICKS} label={`${pickedCount} / ${TOTAL_BRACKET_PICKS}`} />
    </>
  );

  return (
    <section className="space-y-4 lg:space-y-6">
      <PickemsHeader step="bracket" rightSlot={rightSlot} />

      <PickemsStepper current={step} progress={progress} onChange={onStep} canNavigateTo={canNavigateTo} />

      <BracketDesktop bracket={projected} champion={champion} disabled={data.is_locked} onPick={pick} />
      <BracketMobile bracket={projected} champion={champion} disabled={data.is_locked} onPick={pick} activeStage={activeStage} onStageChange={setActiveStage} />

      <p className="text-center text-xs text-muted-foreground">{tCommon("bracket.hint")}</p>

      <PickemsCTABar action={mobileAction} onBack={mobileBack} />
    </section>
  );
}
