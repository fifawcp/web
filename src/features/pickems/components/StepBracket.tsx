"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useBracketDraft } from "../hooks/useBracketDraft";
import { useSubmitBracket } from "../hooks/useSubmitBracket";
import { TOTAL_BRACKET_PICKS } from "../lib/bracketStructure";
import { prevStep } from "../lib/pickemStep";
import { findChampion, projectBracket } from "../lib/projectBracket";
import type { BracketDraft, PickemProgress, PickemStep, UserPickem } from "../types/pickems.types";

import { BracketTree } from "./BracketTree";
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
  const tCommon = useTranslations("pickems.common");
  const { draft: rawDraft, pick } = useBracketDraft(userId);
  const { submit, isSubmitting } = useSubmitBracket();

  // When locked, ignore the local draft — only show what the user committed.
  const draft = data.is_locked ? EMPTY_DRAFT : rawDraft;

  const projected = useMemo(() => projectBracket(data.bracket, draft), [data.bracket, draft]);
  const champion = findChampion(projected);

  const pickedCount = projected.reduce((n, slot) => (slot.picked_team ? n + 1 : n), 0);
  const isReady = pickedCount === TOTAL_BRACKET_PICKS;

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
        onClick: () => submit(draft),
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
