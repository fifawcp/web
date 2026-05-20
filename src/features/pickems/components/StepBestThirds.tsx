"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import type { Team } from "@/shared/types/wcp.types";

import { BEST_THIRDS_REQUIRED_COUNT } from "../hooks/useSaveBestThirds";
import { prevStep } from "../lib/pickemStep";
import type { PickemProgress, PickemStep, UserPickem } from "../types/pickems.types";

import { BestThirdTile } from "./BestThirdTile";
import { PickemsCTABar, type CTAAction } from "./PickemsCTABar";
import { PickemsHeader } from "./PickemsHeader";
import { PickemsHeaderActions } from "./PickemsHeaderActions";
import { PickemsHeaderProgress } from "./PickemsHeaderProgress";
import { PickemsStepper } from "./PickemsStepper";

export const BEST_THIRDS_REQUIRED = BEST_THIRDS_REQUIRED_COUNT;

type Props = {
  data: UserPickem;
  step: PickemStep;
  onStep: (step: PickemStep) => void;
  progress: PickemProgress;
  canNavigateTo: (step: PickemStep) => boolean;
  onToggle: (team: Team) => void;
  onContinue: () => void;
  isSaving: boolean;
};

export function StepBestThirds({ data, step, onStep, progress, canNavigateTo, onToggle, onContinue, isSaving }: Props) {
  const t = useTranslations("pickems");

  // Candidates: every group's 3rd-place team, sorted A → L so the grid is stable
  // regardless of the order group_picks comes back in.
  const candidates = useMemo<Team[]>(() => {
    const list = data.group_picks.flatMap((group) => group.teams.filter((team) => team.position === 3) as Team[]);
    return list.sort((a, b) => a.group_code.localeCompare(b.group_code));
  }, [data.group_picks]);

  const selectedCodes = useMemo(() => new Set(data.best_thirds.map((team) => team.fifa_code)), [data.best_thirds]);
  const count = selectedCodes.size;
  const isReady = count === BEST_THIRDS_REQUIRED;

  const helperText = !isReady ? t("bestThirds.moreNeeded", { n: BEST_THIRDS_REQUIRED - count }) : undefined;
  const prev = prevStep("thirds");
  const backFn = prev ? () => onStep(prev) : undefined;
  const action: CTAAction = data.is_locked
    ? { kind: "hidden" }
    : {
        kind: "continue",
        label: t("common.continueToStep3"),
        disabled: !isReady,
        loading: isSaving,
        helperText,
        onClick: onContinue,
      };

  return (
    <section className="space-y-4 lg:space-y-6">
      <PickemsHeader
        step="thirds"
        rightSlot={
          <>
            <PickemsHeaderActions action={action} onBack={backFn} />
            <PickemsHeaderProgress completed={count} total={BEST_THIRDS_REQUIRED} label={`${count} / ${BEST_THIRDS_REQUIRED}`} />
          </>
        }
      />

      <PickemsStepper current={step} progress={progress} onChange={onStep} canNavigateTo={canNavigateTo} />

      <div className="rounded-xl border bg-card p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((team) => {
            const selected = selectedCodes.has(team.fifa_code);
            const disabled = data.is_locked || (!selected && count >= BEST_THIRDS_REQUIRED);
            return <BestThirdTile key={team.fifa_code} team={team} selected={selected} disabled={disabled} onToggle={() => onToggle(team)} />;
          })}
        </div>
      </div>

      <PickemsCTABar action={action} onBack={backFn} />
    </section>
  );
}
