"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useBracketDraft } from "../hooks/useBracketDraft";
import { useSubmitBracket } from "../hooks/useSubmitBracket";
import { STAGE_MATCH_IDS, STAGES, TOTAL_BRACKET_PICKS } from "../lib/bracketStructure";
import { prevStep } from "../lib/pickemStep";
import { bracketSignature, findChampion, projectBracket } from "../lib/projectBracket";
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

// Debounce before auto-saving a complete board, so rapid edits (e.g. flipping
// the champion a few times) collapse into a single PUT instead of one each.
const AUTO_SAVE_DELAY_MS = 1000;

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
  const tCommon = useTranslations("pickems.common");
  const tToasts = useTranslations("pickems.toasts");
  const { draft: rawDraft, pick } = useBracketDraft(userId);
  const { submit, isSubmitting } = useSubmitBracket();
  // Active stage is owned here so the mobile CTA bar can react to it (per-stage
  // counter, "Next: <round>" button). BracketMobile reads + writes through props.
  const [activeStage, setActiveStage] = useState<BracketStageCode>("round_of_32");

  const goToStage = (stage: BracketStageCode) => {
    setActiveStage(stage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // When locked, ignore the local draft — only show what the user committed.
  const draft = data.is_locked ? EMPTY_DRAFT : rawDraft;

  const projected = useMemo(() => projectBracket(data.bracket, draft), [data.bracket, draft]);
  const champion = findChampion(projected);

  const pickedCount = projected.reduce((n, slot) => (slot.picked_team ? n + 1 : n), 0);
  const isReady = pickedCount === TOTAL_BRACKET_PICKS;

  // Auto-save: desktop users scroll past the header Save and forget to commit, so
  // once the board is complete we push it for them. We save only when the
  // projected board differs from what's already on the server, debounced to batch
  // rapid edits. `lastAutoSaved` holds the last signature we attempted: after the
  // optimistic update it equals the server's, so success goes quiet; after an
  // error the rollback makes it differ again, but the guard stops us re-firing the
  // same failed payload (the Save button remains for a manual retry). Any *new*
  // edit changes the signature and re-enables auto-save.
  const savedSignature = useMemo(() => bracketSignature(data.bracket), [data.bracket]);
  const projectedSignature = useMemo(() => bracketSignature(projected), [projected]);
  const lastAutoSaved = useRef<string | null>(null);

  useEffect(() => {
    if (data.is_locked || !isReady || isSubmitting) return;
    if (projectedSignature === savedSignature) return; // already committed
    if (projectedSignature === lastAutoSaved.current) return; // don't re-fire a failed payload
    const id = window.setTimeout(() => {
      lastAutoSaved.current = projectedSignature;
      submit(projected);
    }, AUTO_SAVE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [data.is_locked, isReady, isSubmitting, projectedSignature, savedSignature, projected, submit]);

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
  const helperText = isReady ? tCommon("readyToSubmit") : t("picksLeft", { n: TOTAL_BRACKET_PICKS - pickedCount });
  const desktopBack = !data.is_locked && prev ? () => onStep(prev) : undefined;
  // Mobile back walks the tabs leftward; once we're at R32, it falls through to
  // the step-level back (→ best thirds). Keeps the gesture meaning "previous"
  // whether that's a previous round or the previous step. When locked, we drop
  // the Back affordance entirely — the stepper is the only navigation.
  const mobileBack = data.is_locked ? undefined : prevStage ? () => goToStage(prevStage) : desktopBack;

  const desktopAction: CTAAction = data.is_locked
    ? { kind: "hidden" }
    : {
        kind: "submit",
        label: t("submit"),
        disabled: !isReady,
        loading: isSubmitting,
        helperText,
        helperTone: isReady ? "ready" : undefined,
        onClick: () => submit(projected),
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
          helperText: stageStats.isComplete ? tCommon("readyForRound", { round: tRounds(nextStage) }) : t("roundLeft", { n: stageStats.remaining }),
          helperTone: stageStats.isComplete ? "ready" : undefined,
          onClick: () => {
            if (!stageStats.isComplete) {
              toast(tToasts("finishRoundFirst"));
              return;
            }
            goToStage(nextStage);
          },
        }
      : {
          kind: "submit",
          label: t("submit"),
          disabled: !isReady,
          loading: isSubmitting,
          helperText,
          helperTone: isReady ? "ready" : undefined,
          onClick: () => submit(projected),
        };

  const rightSlot = (
    <div className="hidden flex-col items-stretch gap-2.5 lg:flex">
      <PickemsHeaderActions action={desktopAction} onBack={desktopBack} />
      <PickemsHeaderProgress
        completed={pickedCount}
        total={TOTAL_BRACKET_PICKS}
        label={`${pickedCount} / ${TOTAL_BRACKET_PICKS}`}
        helperText={data.is_locked ? undefined : helperText}
        helperTone={isReady ? "ready" : undefined}
      />
    </div>
  );

  return (
    <section className="space-y-4 lg:space-y-6">
      <PickemsHeader step="bracket" rightSlot={rightSlot} />

      <PickemsStepper current={step} progress={progress} onChange={onStep} canNavigateTo={canNavigateTo} />

      <BracketDesktop bracket={projected} champion={champion} disabled={data.is_locked} onPick={pick} />
      <BracketMobile bracket={projected} champion={champion} disabled={data.is_locked} onPick={pick} activeStage={activeStage} onStageChange={goToStage} />

      <PickemsCTABar
        action={mobileAction}
        onBack={mobileBack}
        progress={nextStage ? { completed: stageStats.completed, total: stageStats.total } : { completed: pickedCount, total: TOTAL_BRACKET_PICKS }}
      />
    </section>
  );
}
