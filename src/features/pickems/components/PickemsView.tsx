"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { AwardsCrossSell } from "@/features/awards/components/AwardsCrossSell";
import { useHydrated } from "@/shared/hooks/useHydrated";

import { useBracketDraft } from "../hooks/useBracketDraft";
import { usePickems } from "../hooks/usePickems";
import { useSaveBestThirds } from "../hooks/useSaveBestThirds";
import { useSaveGroups } from "../hooks/useSaveGroups";
import { useStep } from "../hooks/useStep";
import { readBestThirdsDraft } from "../lib/bestThirdsDraftStorage";
import { readGroupsDraft } from "../lib/groupsDraftStorage";
import { highestValidStep, stepIndex } from "../lib/pickemStep";
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

  // Cross-device step guard: if the URL carries a step ahead of what the server
  // committed (e.g. `?step=bracket` left over from a previous session while
  // another device reset groups/thirds), we must show the correct step without
  // a flash. `effectiveStep` starts as the clamped value from `useState` so the
  // render is immediately correct; the URL is fixed asynchronously once the
  // mount effect runs.
  const maxStepOnLoad: PickemStep = !initialData.is_locked ? highestValidStep(initialData) : "bracket";
  const [effectiveStep, setEffectiveStep] = useState<PickemStep>(() => (stepIndex(step) > stepIndex(maxStepOnLoad) ? maxStepOnLoad : step));
  // Used ONLY inside effects — never during render (would violate React Compiler rules).
  const mountCorrectionDone = useRef(false);

  // MUST be declared before the mount-correction effect so it fires first on mount.
  // Effects run in declaration order: on mount `mountCorrectionDone.current` is still
  // false here, so we skip; subsequent URL changes (from the correction or user nav)
  // arrive after the flag is set and drive effectiveStep going forward.
  useEffect(() => {
    if (!mountCorrectionDone.current) return;
    setEffectiveStep(step);
  }, [step]);

  // Mount-only: open the step sync, then correct the URL + toast if needed.
  useEffect(() => {
    mountCorrectionDone.current = true;
    if (stepIndex(step) > stepIndex(maxStepOnLoad)) {
      rawSetStep(maxStepOnLoad);
      toast.info(tToasts("crossDeviceStepReset"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Each step is its own screen — land at the top when moving between them
  // (e.g. Continue from groups → best thirds → bracket) so the new step's header
  // is in view rather than wherever the previous step was scrolled. Skips the
  // first render so a deep-linked step isn't yanked to the top on load.
  const isInitialStep = useRef(true);
  useEffect(() => {
    if (isInitialStep.current) {
      isInitialStep.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [effectiveStep]);

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

  // Progress counts derived from the *local* cache state. The stepper sub-line and
  // the navigability gate both read from here so they reflect the user's pending edits
  // immediately. Groups counts the locally-set `locked` flags — locking is local-first,
  // so a tap flips this count instantly, before the next bulk save persists it. Once the
  // tournament is locked every group reads as final (see GroupCard), so the count is
  // pinned to total/total to match that frozen presentation.
  const progress: PickemProgress = useMemo(() => {
    const projected = projectBracket(data.bracket, effectiveBracketDraft);
    const bracketCount = projected.reduce((n, slot) => (slot.picked_team ? n + 1 : n), 0);
    const groupsTotal = data.group_picks.length;

    return {
      groups: { completed: data.is_locked ? groupsTotal : data.group_picks.filter((g) => g.locked).length, total: groupsTotal },
      best_thirds: { completed: data.best_thirds.length, total: 8 },
      bracket: { completed: bracketCount, total: 32 },
    };
  }, [data.is_locked, data.group_picks, data.best_thirds.length, data.bracket, effectiveBracketDraft]);

  // Forward navigation is only allowed when the previous step is complete.
  // Step 1 (groups) is the entry point. Step 2 needs all 12 groups *locked*
  // (the locally-counted lock flags == 12). Step 3 needs step 2 at 8/8.
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

      {/* Secondary entry point into the bonus awards feature — kept above the
          step header + stepper so it stays prominent regardless of step. */}
      <AwardsCrossSell isLocked={data.is_locked} />

      {effectiveStep === "groups" && (
        <StepGroups
          data={data}
          step={effectiveStep}
          onStep={setStep}
          progress={progress}
          canNavigateTo={canNavigateTo}
          onReorder={groupsSave.reorder}
          onToggleLock={groupsSave.toggleLock}
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
      {effectiveStep === "thirds" && (
        <StepBestThirds
          data={data}
          step={effectiveStep}
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
      {effectiveStep === "bracket" && <StepBracket data={data} step={effectiveStep} onStep={setStep} progress={progress} canNavigateTo={canNavigateTo} userId={userId} />}
    </div>
  );
}
