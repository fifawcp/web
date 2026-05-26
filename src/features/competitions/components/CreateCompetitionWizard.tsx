"use client";

import { Fragment, useMemo, useState } from "react";
import { Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useAutoFocusUnlessMobile } from "@/shared/hooks/useAutoFocusUnlessMobile";
import { translateApiError } from "@/shared/lib/api/errors";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { GroupCode, StageCode, Team } from "@/shared/types/wcp.types";

import { COMPETITION_PARAM } from "../hooks/useCompetitionUrlState";
import { useCreateCompetition } from "../hooks/useCreateCompetition";
import { ALL_STAGES } from "../lib/formatScope";

const NAME_MAX = 20;
const STEP_KEYS = ["name", "scope", "summary"] as const;
type StepKey = (typeof STEP_KEYS)[number];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: number;
  teams: Team[];
};

export function CreateCompetitionWizard({ open, onOpenChange, boardId, teams }: Props) {
  const t = useTranslations("competitions.create");
  const tStages = useTranslations("schedule.filters.stage");
  const tApiErrors = useTranslations("apiErrors");
  const router = useRouter();
  const mutation = useCreateCompetition(boardId);

  const allTeamCodes = useMemo(() => teams.map((team) => team.fifa_code), [teams]);

  const [step, setStep] = useState<StepKey>("name");
  const [name, setName] = useState("");
  const [stages, setStages] = useState<StageCode[]>([]);
  const [teamCodes, setTeamCodes] = useState<string[]>([]);
  const focus = useAutoFocusUnlessMobile();

  const trimmed = name.trim();
  const isNameValid = trimmed.length > 0 && trimmed.length <= NAME_MAX;
  const isScopeValid = stages.length > 0 && teamCodes.length > 0;
  const isAllTeams = teamCodes.length === allTeamCodes.length;
  const isAllStages = stages.length === ALL_STAGES.length;

  const teamsByGroup = useMemo(() => {
    const groups = new Map<GroupCode | "_", Team[]>();
    for (const team of teams) {
      const key = team.group_code ?? "_";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(team);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => String(a).localeCompare(String(b)));
  }, [teams]);

  function reset() {
    setStep("name");
    setName("");
    setStages([]);
    setTeamCodes([]);
  }

  function close() {
    reset();
    onOpenChange(false);
  }

  function toggleStage(stage: StageCode) {
    setStages((prev) => (prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]));
  }

  function toggleAllStages() {
    setStages((prev) => (prev.length === ALL_STAGES.length ? [] : [...ALL_STAGES]));
  }

  function toggleTeam(code: string) {
    setTeamCodes((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  function toggleAllTeams() {
    setTeamCodes((prev) => (prev.length === allTeamCodes.length ? [] : [...allTeamCodes]));
  }

  function setGroup(groupTeams: Team[], select: boolean) {
    const codes = groupTeams.map((team) => team.fifa_code);
    setTeamCodes((prev) => {
      if (select) {
        const set = new Set([...prev, ...codes]);
        return Array.from(set);
      }
      return prev.filter((code) => !codes.includes(code));
    });
  }

  const currentIndex = STEP_KEYS.indexOf(step);

  function canReach(target: StepKey): boolean {
    if (target === "name") return true;
    if (target === "scope") return isNameValid;
    return isNameValid && isScopeValid;
  }

  function isStepComplete(target: StepKey): boolean {
    const targetIndex = STEP_KEYS.indexOf(target);
    if (targetIndex >= currentIndex) return false;
    if (target === "name") return isNameValid;
    if (target === "scope") return isScopeValid;
    return false;
  }

  async function submit() {
    const created = await mutation
      .mutateAsync({
        name: trimmed,
        type: "match",
        scope: {
          stages,
          team_fifa_codes: isAllTeams ? [] : teamCodes,
        },
      })
      .catch((error: Error) => {
        toast.error(translateApiError(error, tApiErrors));
        return null;
      });
    if (!created) return;

    toast.success(t("success"));
    close();
    const params = new URLSearchParams(window.location.search);
    params.set(COMPETITION_PARAM, String(created.id));
    router.replace(`?${params.toString()}`, { scroll: false });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-2xl" onOpenAutoFocus={focus.onOpenAutoFocus}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Stepper current={step} canReach={canReach} isComplete={isStepComplete} onChange={setStep} />

        <div className="-mx-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6">
          {step === "name" ? (
            <Field>
              <FieldLabel htmlFor="comp-name">{t("name.label")}</FieldLabel>
              <Input
                id="comp-name"
                autoFocus={focus.autoFocus}
                maxLength={NAME_MAX}
                placeholder={t("name.placeholder")}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="focus-visible:border-page-accent-strong focus-visible:ring-page-accent-strong/30"
              />
              <FieldDescription>{t("name.helper")}</FieldDescription>
            </Field>
          ) : null}

          {step === "scope" ? (
            <div className="flex flex-col gap-4">
              <section className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-sm font-medium">{t("scope.stages")}</h4>
                    <span className="text-xs text-muted-foreground">
                      {stages.length === 0 ? t("scope.stagesHelper") : t("scope.selectedStages", { count: stages.length })}
                    </span>
                  </div>
                  <ScopeToggle active={isAllStages} onToggle={toggleAllStages} activeLabel={t("scope.unselectAllStages")} inactiveLabel={t("scope.selectAllStages")} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_STAGES.map((stage) => {
                    const selected = stages.includes(stage);
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => toggleStage(stage)}
                        aria-pressed={selected}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs font-medium uppercase tracking-wide transition-colors",
                          selected ? "border-page-accent-strong/30 bg-page-accent-soft text-page-accent-strong" : "border-border bg-card text-foreground hover:bg-muted"
                        )}
                      >
                        {tStages(stage)}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="flex flex-col gap-2 border-t pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-sm font-medium">{t("scope.teams")}</h4>
                    <span className="text-xs text-muted-foreground">
                      {teamCodes.length === 0 ? t("scope.teamsHelper") : t("scope.selectedTeams", { count: teamCodes.length })}
                    </span>
                  </div>
                  {allTeamCodes.length > 0 ? (
                    <ScopeToggle active={isAllTeams} onToggle={toggleAllTeams} activeLabel={t("scope.unselectAllTeams")} inactiveLabel={t("scope.selectAllTeams")} />
                  ) : null}
                </div>
                <div className="grid max-h-72 grid-cols-1 gap-3 overflow-y-auto rounded-lg border bg-muted/30 sm:grid-cols-2">
                  {teamsByGroup.map(([group, groupTeams]) => {
                    const allSelected = groupTeams.every((team) => teamCodes.includes(team.fifa_code));
                    return (
                      <GroupBlock
                        key={String(group)}
                        label={group === "_" ? "—" : `Group ${group}`}
                        allSelected={allSelected}
                        onToggleAll={() => setGroup(groupTeams, !allSelected)}
                        selectAllLabel={t("scope.selectGroup")}
                        unselectAllLabel={t("scope.unselectGroup")}
                      >
                        {groupTeams.map((team) => {
                          const selected = teamCodes.includes(team.fifa_code);
                          return <TeamRow key={team.fifa_code} team={team} selected={selected} onToggle={() => toggleTeam(team.fifa_code)} />;
                        })}
                      </GroupBlock>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : null}

          {step === "summary" ? (
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
              <SummaryRow label={t("summary.name")} value={trimmed} />
              <SummaryRow
                label={t("summary.stages")}
                value={stages.length === ALL_STAGES.length ? <span className="text-muted-foreground">All</span> : stages.map((s) => tStages(s)).join(" · ")}
              />
              <SummaryRow
                label={t("summary.teams")}
                value={isAllTeams ? <span className="text-muted-foreground">All</span> : t("scope.selectedTeams", { count: teamCodes.length })}
              />
            </div>
          ) : null}
        </div>

        <WizardFooter
          step={step}
          onBack={() => setStep(STEP_KEYS[Math.max(0, STEP_KEYS.indexOf(step) - 1)])}
          onCancel={close}
          onNext={() => {
            const i = STEP_KEYS.indexOf(step);
            if (i < STEP_KEYS.length - 1) setStep(STEP_KEYS[i + 1]);
          }}
          onSubmit={submit}
          canContinue={(step === "name" && isNameValid) || (step === "scope" && isScopeValid) || step === "summary"}
          isPending={mutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

type StepState = "completed" | "active" | "upcoming";

function Stepper({
  current,
  canReach,
  isComplete,
  onChange,
}: {
  current: StepKey;
  canReach: (step: StepKey) => boolean;
  isComplete: (step: StepKey) => boolean;
  onChange: (step: StepKey) => void;
}) {
  const t = useTranslations("competitions.create.steps");
  const currentIndex = STEP_KEYS.indexOf(current);

  return (
    <div className="flex w-full items-center rounded-xl border bg-card px-3 py-3 sm:px-4">
      {STEP_KEYS.map((step, i) => {
        const state: StepState = i === currentIndex ? "active" : isComplete(step) ? "completed" : "upcoming";
        const isLast = i === STEP_KEYS.length - 1;
        const reachable = canReach(step);
        const isClickable = state !== "active" && reachable;
        const stepIsDone = isComplete(step);

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
                <div className={cn("text-xs font-medium leading-tight sm:text-sm", state === "upcoming" ? "text-muted-foreground" : "text-foreground")}>{t(step)}</div>
              </div>
            </button>

            {!isLast && <span aria-hidden className={cn("mx-3 h-0.5 flex-1 sm:mx-4", stepIsDone ? "bg-page-accent" : "bg-border")} />}
          </Fragment>
        );
      })}
    </div>
  );
}

function StepDot({ index, state }: { index: number; state: StepState }) {
  const isCompleted = state === "completed";
  const isActive = state === "active";
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
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

// Select-all / clear-all toggle. Used both at the section level (Fases / Equipos headers) and
// per-group, so the broader action reads as the same control as "Marcar grupo entero".
function ScopeToggle({ active, onToggle, activeLabel, inactiveLabel }: { active: boolean; onToggle: () => void; activeLabel: string; inactiveLabel: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-page-accent-strong/30 bg-page-accent-soft text-page-accent-strong hover:bg-page-accent-soft/80"
          : "border-border bg-card text-muted-foreground hover:bg-muted"
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}

function GroupBlock({
  label,
  allSelected,
  onToggleAll,
  selectAllLabel,
  unselectAllLabel,
  children,
}: {
  label: string;
  allSelected: boolean;
  onToggleAll: () => void;
  selectAllLabel: string;
  unselectAllLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>
        <ScopeToggle active={allSelected} onToggle={onToggleAll} activeLabel={unselectAllLabel} inactiveLabel={selectAllLabel} />
      </div>
      <ul className="flex flex-col gap-1.5">{children}</ul>
    </div>
  );
}

function TeamRow({ team, selected, onToggle }: { team: Team; selected: boolean; onToggle: () => void }) {
  const locale = useLocale();
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className={cn(
          "group flex w-full cursor-pointer items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:bg-muted",
          selected ? "border-page-accent" : "border-border"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            selected ? "border-page-accent bg-page-accent text-white" : "border-input bg-card text-transparent"
          )}
        >
          <Check className="size-3.5" />
        </span>
        {team.flag_url ? (
          <div className="shrink-0 overflow-hidden rounded-xs ring-1 ring-border/60">
            <Image src={team.flag_url} alt="" width={28} height={20} sizes="28px" className="h-5 w-7 object-cover" />
          </div>
        ) : (
          <span className="inline-flex h-5 w-7 shrink-0 items-center justify-center rounded-xs bg-muted text-2xs font-semibold">{team.fifa_code}</span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{getTeamName(team, locale)}</span>
      </button>
    </li>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="w-24 shrink-0 text-2xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 font-medium">{value}</dd>
    </div>
  );
}

function WizardFooter({
  step,
  onBack,
  onCancel,
  onNext,
  onSubmit,
  canContinue,
  isPending,
}: {
  step: StepKey;
  onBack: () => void;
  onCancel: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canContinue: boolean;
  isPending: boolean;
}) {
  const t = useTranslations("competitions.create");
  const isFirst = step === "name";
  const isLast = step === "summary";

  return (
    <DialogFooter className="flex-col sm:flex-row-reverse sm:justify-start">
      <Button type="button" onClick={isLast ? onSubmit : onNext} disabled={!canContinue || isPending} className="bg-page-accent text-white hover:bg-page-accent/90">
        {isLast ? t("submit") : t("continue")}
      </Button>
      <Button type="button" variant="outline" onClick={isFirst ? onCancel : onBack} disabled={isPending}>
        {isFirst ? t("cancel") : t("back")}
      </Button>
    </DialogFooter>
  );
}
