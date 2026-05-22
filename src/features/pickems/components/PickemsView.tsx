"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useHydrated } from "@/shared/hooks/useHydrated";

import { useBracketDraft } from "../hooks/useBracketDraft";
import { usePickems } from "../hooks/usePickems";
import { useSaveBestThirds } from "../hooks/useSaveBestThirds";
import { useSaveGroups } from "../hooks/useSaveGroups";
import { useStep } from "../hooks/useStep";
import { readBestThirdsDraft } from "../lib/bestThirdsDraftStorage";
import { readGroupsDraft } from "../lib/groupsDraftStorage";
import { stepIndex } from "../lib/pickemStep";
import { projectBracket, pruneBracketDraft } from "../lib/projectBracket";
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

const CONTAINER = "container flex flex-col gap-6 pt-6 pb-6 lg:pt-8 lg:pb-8";

const EMPTY_BRACKET_DRAFT: BracketDraft = {};

export function PickemsView({ initialData, userId }: Props) {
  const hydrated = useHydrated();
  const tToasts = useTranslations("pickems.toasts");
  const { data = initialData } = usePickems(initialData);
  const [step, rawSetStep] = useStep();
  const { draft: bracketDraft, replaceDraft: replaceBracketDraft, isHydrated: bracketDraftHydrated } = useBracketDraft(userId);
  const groupsSave = useSaveGroups(userId);
  const bestThirdsSave = useSaveBestThirds(userId);
  const [navigating, setNavigating] = useState(false);

  // When the pickem is locked the server is read-only; localStorage drafts can
  // never sync, so ignore them and project against the server-saved state only
  const effectiveBracketDraft = data.is_locked ? EMPTY_BRACKET_DRAFT : bracketDraft;

  // Cross-device drift: another browser may have changed group order or best
  // thirds, which on the server cascades into the R32 home/away pairings. The
  // local draft on *this* device can still hold picks for teams that no longer
  // belong in those slots. Walk the projected bracket and drop the now-invalid
  // entries — otherwise the stepper count, the per-stage tabs and the saved
  // picks all disagree (e.g. R32 shows 15/16 yet QF onward read as complete).
  useEffect(() => {
    if (!bracketDraftHydrated || data.is_locked) return;
    const { pruned, removedCount } = pruneBracketDraft(data.bracket, bracketDraft);
    if (removedCount === 0) return;
    replaceBracketDraft(pruned);
    toast.warning(tToasts("picksClearedByGroupChange", { n: removedCount }));
  }, [bracketDraftHydrated, data.is_locked, data.bracket, bracketDraft, replaceBracketDraft, tToasts]);

  // Progress counts derived from the *local* cache state (or pure server state
  // when locked). The stepper sub-line and the navigability gate both read
  // from here so they reflect the user's pending edits immediately.
  //
  // Groups is the exception: `group_picks` always contains all 12 entries
  // (defaults included), so its length isn't a usable "completed" signal —
  // use the server's progress count, which flips 0 → 12 after the first save.
  // Step 1's navigation gate is hard-coded to `true` regardless, so the lag
  // between a local reorder and the save doesn't block forward movement.
  const progress: PickemProgress = useMemo(() => {
    const projected = projectBracket(data.bracket, effectiveBracketDraft);
    const bracketCount = projected.reduce((n, slot) => (slot.picked_team ? n + 1 : n), 0);

    return {
      groups: data.progress.groups,
      best_thirds: { completed: data.best_thirds.length, total: 8 },
      bracket: { completed: bracketCount, total: 32 },
    };
  }, [data.progress.groups, data.best_thirds.length, data.bracket, effectiveBracketDraft]);

  // Forward navigation is only allowed when the previous step is complete.
  // Step 1 (groups) is the entry point. Step 2 needs all 12 groups *locked*
  // (server's `progress.groups.completed` == 12). Step 3 needs step 2 at 8/8.
  // When the tournament is locked, every step is reachable for read-only review.
  const canNavigateTo = useCallback(
    (target: PickemStep): boolean => {
      if (data.is_locked) return true;
      if (target === "groups") return true;
      if (target === "thirds") return progress.groups.completed === progress.groups.total;
      return progress.best_thirds.completed === progress.best_thirds.total;
    },
    [data.is_locked, progress.groups.completed, progress.groups.total, progress.best_thirds.completed, progress.best_thirds.total]
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
          onToggleLock={groupsSave.toggleLock}
          lockingGroupCode={groupsSave.lockingGroupCode}
          onSaveDraft={groupsSave.saveDraft}
          onContinue={async () => {
            try {
              if (readGroupsDraft(userId)) {
                await groupsSave.saveAndAwait();
              }
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
              if (readBestThirdsDraft(userId)) {
                await bestThirdsSave.saveAndAwait();
              }
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
