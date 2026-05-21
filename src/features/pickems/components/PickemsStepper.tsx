"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import { PICKEM_STEPS, stepIndex } from "../lib/pickemStep";
import type { PickemProgress, PickemStep } from "../types/pickems.types";

type Props = {
  current: PickemStep;
  progress: PickemProgress;
  onChange: (step: PickemStep) => void;
  /**
   * Defaults to always true. Pass to gate forward navigation on a step's
   * prerequisites — chips for unreachable steps are dimmed and the click is a no-op.
   */
  canNavigateTo?: (step: PickemStep) => boolean;
};

type StepState = "completed" | "active" | "upcoming";

export function PickemsStepper({ current, progress, onChange, canNavigateTo = () => true }: Props) {
  const t = useTranslations("pickems.stepper");
  const currentIdx = stepIndex(current);

  return (
    <div className="flex w-full items-center rounded-xl border bg-card px-3 py-3 sm:px-4">
      {PICKEM_STEPS.map((step, i) => {
        const state = stepState(i, currentIdx, progress);
        const isLast = i === PICKEM_STEPS.length - 1;
        const reachable = canNavigateTo(step);
        const isClickable = state !== "active" && reachable;
        const label = t(`${i + 1}`);
        const sub = subline(step, progress);
        // Line after this step uses the accent when this step is done so the
        // accent flows continuously through every completed segment.
        const stepIsDone = isStepComplete(i, progress);

        return (
          <Fragment key={step}>
            <button
              type="button"
              onClick={() => isClickable && onChange(step)}
              disabled={!isClickable}
              aria-current={state === "active" ? "step" : undefined}
              className={cn(
                "flex shrink-0 flex-col items-center justify-center gap-2 sm:flex-row",
                isClickable ? "cursor-pointer" : "cursor-default",
                !reachable && state !== "active" && "opacity-50"
              )}
            >
              <StepDot index={i} state={state} />
              <div className="text-center sm:text-left">
                <div className={cn("text-xs font-medium leading-tight sm:text-sm", state === "upcoming" ? "text-muted-foreground" : "text-foreground")}>{label}</div>
                <div className="font-mono text-2xs uppercase tracking-wider tabular-nums text-muted-foreground">{sub}</div>
              </div>
            </button>

            {!isLast && <span aria-hidden className={cn("mx-3 h-0.5 flex-1 sm:mx-4", stepIsDone ? "bg-page-accent" : "bg-border")} />}
          </Fragment>
        );
      })}
    </div>
  );
}

function stepState(index: number, currentIdx: number, progress: PickemProgress): StepState {
  if (index === currentIdx) return "active";
  if (isStepComplete(index, progress)) return "completed";
  return "upcoming";
}

function isStepComplete(index: number, progress: PickemProgress): boolean {
  const stepProgress = index === 0 ? progress.groups : index === 1 ? progress.best_thirds : progress.bracket;
  return stepProgress.completed >= stepProgress.total && stepProgress.total > 0;
}

function StepDot({ index, state }: { index: number; state: StepState }) {
  const isCompleted = state === "completed";
  const isActive = state === "active";

  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
        // Active = SOLID accent (strongest, "you are here"). Completed =
        // SOFT accent (done, but secondary to current). Upcoming = neutral.
        isActive && "border-page-accent bg-page-accent text-white",
        isCompleted && "border-page-accent bg-page-accent-soft text-page-accent-strong",
        state === "upcoming" && "border-muted-foreground/40 bg-card text-muted-foreground"
      )}
      aria-hidden
    >
      {isCompleted ? <Check className="size-3.5" /> : index + 1}
    </span>
  );
}

/** Minimal {completed} / {total} per step — pure numerics, no localized text. */
function subline(step: PickemStep, progress: PickemProgress): string {
  if (step === "groups") return `${progress.groups.completed} / ${progress.groups.total}`;
  if (step === "thirds") return `${progress.best_thirds.completed} / ${progress.best_thirds.total}`;
  return `${progress.bracket.completed} / ${progress.bracket.total}`;
}
