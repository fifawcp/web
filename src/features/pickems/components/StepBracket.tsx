"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";

import { useBracketDraft } from "../hooks/useBracketDraft";
import { useSubmitBracket } from "../hooks/useSubmitBracket";
import { TOTAL_BRACKET_PICKS } from "../lib/bracketStructure";
import { prevStep } from "../lib/pickemStep";
import { bracketSignature, findChampion, projectBracket } from "../lib/projectBracket";
import type { BracketDraft, PickemProgress, PickemStep, UserPickem } from "../types/pickems.types";

import { BracketTree } from "./BracketTree";
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
  const tCommon = useTranslations("pickems.common");
  const { draft: rawDraft, pick } = useBracketDraft(userId);
  const { submit, isSubmitting } = useSubmitBracket();

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

  const prev = prevStep("bracket");
  const helperText = isReady ? tCommon("readyToSubmit") : t("picksLeft", { n: TOTAL_BRACKET_PICKS - pickedCount });
  const back = !data.is_locked && prev ? () => onStep(prev) : undefined;

  // The bracket now scrolls horizontally (no per-round tabs), so the desktop
  // header and the mobile CTA bar share one Submit action + overall progress.
  const action: CTAAction = data.is_locked
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

  const rightSlot = (
    <div className="hidden flex-col items-stretch gap-2.5 lg:flex">
      <PickemsHeaderActions action={action} onBack={back} />
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

      <BracketTree bracket={projected} champion={champion} disabled={data.is_locked} onPick={pick} />

      <PickemsCTABar action={action} onBack={back} progress={{ completed: pickedCount, total: TOTAL_BRACKET_PICKS }} />
    </section>
  );
}
