"use client";

import { Fragment, useMemo, useState } from "react";
import { Check } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import type { Match } from "@/features/schedule/types/schedule.types";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useAutoFocusUnlessMobile } from "@/shared/hooks/useAutoFocusUnlessMobile";
import { translateApiError } from "@/shared/lib/api/errors";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { GroupCode, StageCode, Team } from "@/shared/types/wcp.types";

import { useCreateCompetition } from "../hooks/useCreateCompetition";
import { competitionTypeMeta } from "../lib/competitionTypeMeta";
import { ALL_STAGES } from "../lib/formatScope";
import type { CompetitionType } from "../types/competitions.types";

import { PickMatchPicker } from "./PickMatchPicker";

const NAME_MAX = 20;
type CompetitionKind = "match" | "pick" | "pickem" | "awards";
type StepKey = "details" | "scope" | "match" | "summary";

// Step 1 picks the type and names it; the second step branches by type. Custom is the default path
// so the full stepper is visible before a type is chosen.
const STEPS_BY_KIND: Record<CompetitionKind, StepKey[]> = {
  match: ["details", "scope", "summary"],
  pick: ["details", "match", "summary"],
  pickem: ["details", "summary"],
  awards: ["details", "summary"],
};
const DEFAULT_STEPS: StepKey[] = ["details", "scope", "summary"];

type SingletonKind = "pickem" | "awards";
const SINGLETON_NAME: Record<SingletonKind, string> = { pickem: "Pick'em", awards: "Awards" };
const isSingleton = (kind: CompetitionKind | null): kind is SingletonKind => kind === "pickem" || kind === "awards";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: number;
  teams: Team[];
  matches: Match[];
  existingTypes: CompetitionType[];
};

export function CreateCompetitionWizard({ open, onOpenChange, boardId, teams, matches, existingTypes }: Props) {
  const t = useTranslations("competitions.create");
  const tRoot = useTranslations("competitions");
  const tStages = useTranslations("schedule.filters.stage");
  const tApiErrors = useTranslations("apiErrors");
  const locale = useLocale();
  const router = useRouter();
  const mutation = useCreateCompetition(boardId);

  const allTeamCodes = useMemo(() => teams.map((team) => team.fifa_code), [teams]);

  const [kind, setKind] = useState<CompetitionKind | null>(null);
  const [step, setStep] = useState<StepKey>("details");
  const [name, setName] = useState("");
  const [stages, setStages] = useState<StageCode[]>([]);
  const [teamCodes, setTeamCodes] = useState<string[]>([]);
  const [pickMatchId, setPickMatchId] = useState<number | null>(null);
  const focus = useAutoFocusUnlessMobile();

  const steps = kind ? STEPS_BY_KIND[kind] : DEFAULT_STEPS;

  const trimmed = name.trim();
  const isNameValid = trimmed.length > 0 && trimmed.length <= NAME_MAX;
  const isScopeValid = stages.length > 0 && teamCodes.length > 0;
  const isMatchValid = pickMatchId !== null;
  const isBranchValid = kind === "pick" ? isMatchValid : kind === "match" ? isScopeValid : true;
  const isAllTeams = teamCodes.length === allTeamCodes.length;
  const isAllStages = stages.length === ALL_STAGES.length;

  const pickMatch = pickMatchId != null ? matches.find((m) => m.id === pickMatchId) : undefined;
  const pickName = pickMatch ? `${pickMatch.teams.home?.fifa_code ?? "?"} vs ${pickMatch.teams.away?.fifa_code ?? "?"}` : "";
  const resolvedName = kind === "pick" ? pickName : isSingleton(kind) ? SINGLETON_NAME[kind] : trimmed;
  const isDetailsValid = kind !== null && (kind === "pick" || isSingleton(kind) || isNameValid);
  const nameFixed = kind === "pick" || isSingleton(kind);

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
    setKind(null);
    setStep("details");
    setName("");
    setStages([]);
    setTeamCodes([]);
    setPickMatchId(null);
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
      if (select) return Array.from(new Set([...prev, ...codes]));
      return prev.filter((code) => !codes.includes(code));
    });
  }

  const currentIndex = steps.indexOf(step);

  function canReach(target: StepKey): boolean {
    if (target === "details") return true;
    if (target === "scope" || target === "match") return isDetailsValid;
    return isDetailsValid && isBranchValid;
  }

  function isStepComplete(target: StepKey): boolean {
    if (steps.indexOf(target) >= currentIndex) return false;
    if (target === "details") return isDetailsValid;
    if (target === "scope") return isScopeValid;
    if (target === "match") return isMatchValid;
    return false;
  }

  const canContinue = (step === "details" && isDetailsValid) || (step === "scope" && isScopeValid) || (step === "match" && isMatchValid) || step === "summary";

  async function submit() {
    const input =
      kind === "pick"
        ? ({ name: resolvedName, type: "pick", match_id: pickMatchId! } as const)
        : kind === "pickem"
          ? ({ name: resolvedName, type: "pickem" } as const)
          : kind === "awards"
            ? ({ name: resolvedName, type: "awards" } as const)
            : ({ name: resolvedName, type: "match", scope: { stages, team_fifa_codes: isAllTeams ? [] : teamCodes } } as const);

    const created = await mutation.mutateAsync(input).catch((error: Error) => {
      toast.error(translateApiError(error, tApiErrors));
      return null;
    });
    if (!created) return;

    toast.success(t("success"));
    close();
    // Stay on the board; refresh so the RSC picks up the new competition card.
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-2xl" onOpenAutoFocus={focus.onOpenAutoFocus}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Stepper steps={steps} current={step} canReach={canReach} isComplete={isStepComplete} onChange={setStep} />

        <div className="-mx-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6">
          {step === "details" ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t("type.label")}</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TypeCard
                    type="match"
                    active={kind === "match"}
                    title={tRoot("type.match")}
                    description={t("type.customDescription")}
                    onClick={() => setKind("match")}
                  />
                  <TypeCard type="pick" active={kind === "pick"} title={tRoot("type.pick")} description={t("type.pickDescription")} onClick={() => setKind("pick")} />
                  {!existingTypes.includes("pickem") ? (
                    <TypeCard
                      type="pickem"
                      active={kind === "pickem"}
                      title={tRoot("type.pickem")}
                      description={t("type.pickemDescription")}
                      onClick={() => setKind("pickem")}
                    />
                  ) : null}
                  {!existingTypes.includes("awards") ? (
                    <TypeCard
                      type="awards"
                      active={kind === "awards"}
                      title={tRoot("type.awards")}
                      description={t("type.awardsDescription")}
                      onClick={() => setKind("awards")}
                    />
                  ) : null}
                </div>
              </div>
              <Field>
                <FieldLabel htmlFor="comp-name">{t("name.label")}</FieldLabel>
                {nameFixed ? (
                  <Input id="comp-name" value={resolvedName} disabled placeholder={t("name.pickPlaceholder")} />
                ) : (
                  <Input
                    id="comp-name"
                    maxLength={NAME_MAX}
                    placeholder={t("name.placeholder")}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="focus-visible:border-page-accent-strong focus-visible:ring-page-accent-strong/30"
                  />
                )}
                <FieldDescription>{kind === "pick" ? t("name.pickHelper") : isSingleton(kind) ? t("name.fixedHelper") : t("name.helper")}</FieldDescription>
              </Field>
            </div>
          ) : null}

          {step === "match" ? <PickMatchPicker matches={matches} value={pickMatchId} onChange={setPickMatchId} /> : null}

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
              <SummaryRow label={t("summary.type")} value={kind ? tRoot(`type.${kind}`) : ""} />
              <SummaryRow label={t("summary.name")} value={resolvedName} />
              {kind === "pick" ? (
                <SummaryRow
                  label={t("summary.match")}
                  value={pickMatch ? `${teamLabel(pickMatch.teams.home, locale)} ${t("match.vs")} ${teamLabel(pickMatch.teams.away, locale)}` : ""}
                />
              ) : isSingleton(kind) ? null : (
                <>
                  <SummaryRow
                    label={t("summary.stages")}
                    value={isAllStages ? <span className="text-muted-foreground">All</span> : stages.map((s) => tStages(s)).join(" · ")}
                  />
                  <SummaryRow
                    label={t("summary.teams")}
                    value={isAllTeams ? <span className="text-muted-foreground">All</span> : t("scope.selectedTeams", { count: teamCodes.length })}
                  />
                </>
              )}
            </div>
          ) : null}
        </div>

        <WizardFooter
          step={step}
          onBack={() => setStep(steps[Math.max(0, currentIndex - 1)])}
          onCancel={close}
          onNext={() => {
            if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
          }}
          onSubmit={submit}
          canContinue={canContinue}
          isPending={mutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

function teamLabel(team: Team | null, loc: string): string {
  return team ? getTeamName(team, loc) : "—";
}

function TypeCard({ type, active, title, description, onClick }: { type: CompetitionKind; active: boolean; title: string; description: string; onClick: () => void }) {
  const meta = competitionTypeMeta(type);
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted sm:flex-col sm:items-start sm:gap-2 sm:p-4",
        active ? "border-page-accent ring-1 ring-page-accent/20" : "border-border"
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", meta.tileClass)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-heading text-base font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

type StepState = "completed" | "active" | "upcoming";

function Stepper({
  steps,
  current,
  canReach,
  isComplete,
  onChange,
}: {
  steps: StepKey[];
  current: StepKey;
  canReach: (step: StepKey) => boolean;
  isComplete: (step: StepKey) => boolean;
  onChange: (step: StepKey) => void;
}) {
  const t = useTranslations("competitions.create.steps");
  const currentIndex = steps.indexOf(current);

  return (
    <div className="flex w-full items-center rounded-xl border bg-card px-3 py-3 sm:px-4">
      {steps.map((step, i) => {
        const state: StepState = i === currentIndex ? "active" : isComplete(step) ? "completed" : "upcoming";
        const isLast = i === steps.length - 1;
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
  const loc = useLocale();
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
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{getTeamName(team, loc)}</span>
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
  const isFirst = step === "details";
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
