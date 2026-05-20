"use client";

import { useCallback, useMemo, useState } from "react";

import { useHydrated } from "@/shared/hooks/useHydrated";

import { useBracketDraft } from "../hooks/useBracketDraft";
import { usePickems } from "../hooks/usePickems";
import { useSaveBestThirds } from "../hooks/useSaveBestThirds";
import { useSaveGroups } from "../hooks/useSaveGroups";
import { useStep } from "../hooks/useStep";
import { readBestThirdsDraft } from "../lib/bestThirdsDraftStorage";
import { readGroupsDraft } from "../lib/groupsDraftStorage";
import { stepIndex } from "../lib/pickemStep";
import { projectBracket } from "../lib/projectBracket";
import type { BracketDraft, PickemProgress, PickemStep, UserPickem } from "../types/pickems.types";

import { PickemsLockedBanner } from "./PickemsLockedBanner";
import { PickemsSkeleton } from "./PickemsSkeleton";
import { StepBestThirds } from "./StepBestThirds";
import { StepBracket } from "./StepBracket";
import { StepGroups } from "./StepGroups";

type Props = {
  initialData: UserPickem;
  userId: string | undefined;
};

const CONTAINER = "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 lg:pb-8 lg:pt-8";

const EMPTY_BRACKET_DRAFT: BracketDraft = {};

export function PickemsView({ initialData, userId }: Props) {
  const hydrated = useHydrated();
  const { data = initialData } = usePickems(initialData);
  const [step, rawSetStep] = useStep();
  const { draft: bracketDraft } = useBracketDraft(userId);
  const groupsSave = useSaveGroups(userId);
  const bestThirdsSave = useSaveBestThirds(userId);
  const [navigating, setNavigating] = useState(false);

  // When the pickem is locked the server is read-only; localStorage drafts can
  // never sync, so ignore them and project against the server-saved state only
  const effectiveBracketDraft = data.is_locked ? EMPTY_BRACKET_DRAFT : bracketDraft;

  // Progress counts derived from the *local* cache state (or pure server state
  // when locked). The stepper sub-line and the navigability gate both read
  // from here so they reflect the user's pending edits immediately
  const progress: PickemProgress = useMemo(() => {
    const projected = projectBracket(data.bracket, effectiveBracketDraft);
    const bracketCount = projected.reduce((n, slot) => (slot.picked_team ? n + 1 : n), 0);

    return {
      groups: { completed: data.group_picks.length, total: 12 },
      best_thirds: { completed: data.best_thirds.length, total: 8 },
      bracket: { completed: bracketCount, total: 32 },
    };
  }, [data.group_picks.length, data.best_thirds.length, data.bracket, effectiveBracketDraft]);

  // Forward navigation is only allowed when the previous step is complete.
  // Step 1 is always complete (every group has its 4 default teams), so step 2
  // is always reachable. Step 3 needs step 2 at 8/8. When locked, every step is
  // reachable for read-only review regardless of completeness.
  const canNavigateTo = useCallback(
    (target: PickemStep): boolean => {
      if (data.is_locked) return true;
      if (target === "groups" || target === "thirds") return true;
      return progress.best_thirds.completed === progress.best_thirds.total;
    },
    [data.is_locked, progress.best_thirds.completed, progress.best_thirds.total]
  );

  // Save-aware navigation. Backend rejects step-2 saves when its picks don't
  // align with step-1's saved 3rd-place teams, so before jumping forward via
  // the stepper we flush any pending drafts (in order) and only navigate when
  // the server has accepted them. Backward nav skips the save — drafts stay
  // in localStorage and we'd just hit them again on the next forward jump.
  // When locked, we never save (server returns PICKEM_LOCKED) — just navigate.
  const setStep = useCallback(
    async (target: PickemStep) => {
      if (navigating || !canNavigateTo(target)) return;

      if (data.is_locked) {
        rawSetStep(target);
        return;
      }

      const targetIdx = stepIndex(target);
      const currentIdx = stepIndex(step);

      if (targetIdx <= currentIdx) {
        rawSetStep(target);
        return;
      }

      setNavigating(true);
      try {
        if (readGroupsDraft(userId)) {
          await groupsSave.saveAndAwait();
        }
        if (target === "bracket" && readBestThirdsDraft(userId)) {
          await bestThirdsSave.saveAndAwait();
        }
        rawSetStep(target);
      } catch {
        // Toasts already surfaced by usePickemMutation onError.
      } finally {
        setNavigating(false);
      }
    },
    [navigating, canNavigateTo, data.is_locked, step, rawSetStep, userId, groupsSave, bestThirdsSave]
  );

  if (!hydrated) {
    return (
      <div className={CONTAINER}>
        <PickemsSkeleton step={step} />
      </div>
    );
  }

  return (
    <div className={CONTAINER}>
      {data.is_locked && <PickemsLockedBanner />}

      {step === "groups" && (
        <StepGroups
          data={data}
          step={step}
          onStep={setStep}
          progress={progress}
          canNavigateTo={canNavigateTo}
          onReorder={groupsSave.reorder}
          onSaveDraft={groupsSave.saveDraft}
          onContinue={async () => {
            try {
              await groupsSave.saveAndAwait();
              rawSetStep("thirds");
            } catch {
              // Toast already surfaced.
            }
          }}
          isSaving={groupsSave.isSaving || navigating}
        />
      )}
      {step === "thirds" && (
        <StepBestThirds
          data={data}
          step={step}
          onStep={setStep}
          progress={progress}
          canNavigateTo={canNavigateTo}
          onToggle={bestThirdsSave.toggle}
          onContinue={async () => {
            try {
              await bestThirdsSave.saveAndAwait();
              rawSetStep("bracket");
            } catch {
              // Toast already surfaced
            }
          }}
          isSaving={bestThirdsSave.isSaving || navigating}
        />
      )}
      {step === "bracket" && <StepBracket data={data} step={step} onStep={setStep} progress={progress} canNavigateTo={canNavigateTo} userId={userId} />}
    </div>
  );
}
