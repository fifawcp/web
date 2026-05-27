"use client";

import { useState } from "react";
import { Check, ChevronDown, Crosshair, Flag, ListChecks, Plus, Trash2, Trophy } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Card } from "@/shared/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

import { useCompetitionName } from "../hooks/useCompetitionName";
import { ALL_STAGES, resolveScope } from "../lib/formatScope";
import type { Competition } from "../types/competitions.types";

import { DeleteCompetitionDialog } from "./DeleteCompetitionDialog";

type Props = {
  boardId: number;
  competition: Competition;
  competitions: Competition[];
  teamsByCode: Map<string, Team>;
  canCreate: boolean;
  onSelect: (id: number) => void;
  onCreate: () => void;
  className?: string;
};

type ActionIcon = React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

export function CompetitionInfoCard({ boardId, competition, competitions, teamsByCode, canCreate, onSelect, onCreate, className }: Props) {
  const t = useTranslations("competitions.info");
  const tRoot = useTranslations("competitions");
  const tStages = useTranslations("schedule.filters.stage");
  const competitionName = useCompetitionName();
  const scope = resolveScope(competition);
  const Icon = competition.type === "pickem" ? ListChecks : Trophy;
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleSelect(id: number) {
    setOpen(false);
    if (id !== competition.id) onSelect(id);
  }

  function handleCreate() {
    setOpen(false);
    onCreate();
  }

  function handleDelete() {
    setOpen(false);
    setDeleteOpen(true);
  }

  return (
    <>
      <Card className={cn("gap-0 overflow-hidden border border-foreground/10 p-0 ring-0", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            aria-label={t("change")}
            className="group flex w-full min-w-0 items-center gap-2.5 bg-page-accent-soft px-4 py-3 text-left transition-colors hover:bg-page-accent-soft/80 aria-expanded:bg-page-accent-soft/80"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-card text-page-accent-strong shadow-xs ring-1 ring-foreground/5">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="text-2xs font-medium uppercase tracking-wide text-page-accent-strong/70">{tRoot("label")}</span>
              <span className="truncate font-heading text-sm font-semibold">{competitionName(competition.name)}</span>
            </span>
            <span className="shrink-0 rounded-md bg-card px-1.5 py-0.5 text-xs font-medium text-page-accent-strong shadow-xs ring-1 ring-foreground/5">
              {tRoot(`type.${competition.type}`)}
            </span>
            <ChevronDown className="size-4 shrink-0 text-page-accent-strong transition-transform group-aria-expanded:rotate-180" aria-hidden />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={0}
            onOpenAutoFocus={(event) => event.preventDefault()}
            className="w-(--radix-popover-trigger-width) overflow-hidden rounded-t-none rounded-b-xl border border-t-0 border-foreground/10 p-0 ring-0"
          >
            <SwitcherList competitions={competitions} activeId={competition.id} onSelect={handleSelect} />
            {canCreate ? (
              <section className="flex flex-col gap-1.5 border-t border-border p-3">
                <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{t("switcher.actions")}</p>
                <div className="flex flex-col gap-1.5">
                  <ActionRow icon={Plus} title={t("switcher.add")} subtitle={t("switcher.addSubtitle")} onClick={handleCreate} />
                  {/* The tournament pick'em is protected — it can't be deleted (the API rejects it too). */}
                  {competition.type !== "pickem" ? (
                    <ActionRow icon={Trash2} title={t("switcher.delete")} subtitle={t("switcher.deleteSubtitle")} onClick={handleDelete} tone="destructive" />
                  ) : null}
                </div>
              </section>
            ) : null}
          </PopoverContent>
        </Popover>

        <ScopeSection
          icon={Crosshair}
          label={t("scope")}
          count={t("stagesCount", { count: scope.isAllStages ? ALL_STAGES.length : scope.stages.length })}
          className="border-t border-border/60"
        >
          <StagesValue stages={scope.stages} isAllStages={scope.isAllStages} tStages={tStages} tInfo={t} />
        </ScopeSection>
        <ScopeSection
          icon={Flag}
          label={t("teamsIncluded")}
          count={t("teamsCount", { count: scope.isAllTeams ? teamsByCode.size : scope.teamCodes.length })}
          className="border-t border-border/60"
        >
          <TeamsValue teamCodes={scope.teamCodes} isAllTeams={scope.isAllTeams} teamsByCode={teamsByCode} tInfo={t} />
        </ScopeSection>

        <div className="grid grid-cols-2 divide-x divide-border/60 border-t border-border/60">
          <Stat label={t("rank")} value={`#${competition.viewer.rank}`} />
          <Stat label={t("points")} value={competition.viewer.total_points.toLocaleString()} unit={t("pts")} />
        </div>
      </Card>

      <DeleteCompetitionDialog boardId={boardId} competition={competition} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

function SwitcherList({ competitions, activeId, onSelect }: { competitions: Competition[]; activeId: number; onSelect: (id: number) => void }) {
  const t = useTranslations("competitions.info.switcher");
  const competitionName = useCompetitionName();
  return (
    <div className="flex flex-col p-3">
      <p className="px-1 pb-2 text-2xs font-medium uppercase tracking-wide text-muted-foreground">{t("heading")}</p>
      <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
        {competitions.map((c) => {
          const isActive = c.id === activeId;
          const CIcon = c.type === "pickem" ? ListChecks : Trophy;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn("flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted", isActive && "bg-muted")}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-card text-page-accent-strong shadow-xs ring-1 ring-foreground/5">
                <CIcon className="size-3.5" aria-hidden />
              </span>
              <span className={cn("min-w-0 flex-1 truncate text-sm", isActive ? "font-semibold" : "font-medium")}>{competitionName(c.name)}</span>
              {isActive ? <Check className="size-3.5 shrink-0 text-page-accent-strong" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
  tone = "default",
}: {
  icon: ActionIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
  tone?: "default" | "destructive";
}) {
  const destructive = tone === "destructive";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full min-w-0 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
        destructive && "hover:border-destructive/30 hover:bg-destructive/5"
      )}
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", destructive ? "bg-destructive/10" : "bg-page-accent-soft")}>
        <Icon className={cn("size-4", destructive ? "text-destructive" : "text-page-accent-strong")} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className={cn("truncate text-sm font-semibold", destructive && "text-destructive")}>{title}</span>
        <span className="truncate text-2xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}

function ScopeSection({
  icon: Icon,
  label,
  count,
  children,
  className,
}: {
  icon: ActionIcon;
  label: string;
  count: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5 px-4 py-2.5", className)}>
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-page-accent-strong" aria-hidden />
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">{count}</span>
      </div>
      <div className="flex min-h-6 min-w-0 items-center pl-6 text-sm text-foreground">{children}</div>
    </div>
  );
}

type StagesValueProps = {
  stages: import("@/shared/types/wcp.types").StageCode[];
  isAllStages: boolean;
  tStages: (key: string) => string;
  tInfo: (key: string) => string;
};

function StagesValue({ stages, isAllStages, tStages, tInfo }: StagesValueProps) {
  if (isAllStages) return <AccentChip label={tInfo("allStages")} />;
  const sorted = [...stages].sort((a, b) => ALL_STAGES.indexOf(a) - ALL_STAGES.indexOf(b));
  return (
    <ScrollableRow>
      {sorted.map((s) => (
        <AccentChip key={s} label={tStages(s)} />
      ))}
    </ScrollableRow>
  );
}

function AccentChip({ label }: { label: string }) {
  return <span className="inline-flex shrink-0 items-center rounded-md bg-page-accent-soft px-1.5 py-0.5 text-xs font-medium text-page-accent-strong">{label}</span>;
}

function ScrollableRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">{children}</div>
      <span className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-card to-transparent" aria-hidden />
    </div>
  );
}

type TeamsValueProps = {
  teamCodes: string[];
  isAllTeams: boolean;
  teamsByCode: Map<string, Team>;
  tInfo: (key: string) => string;
};

function TeamsValue({ teamCodes, isAllTeams, teamsByCode, tInfo }: TeamsValueProps) {
  if (isAllTeams) return <AccentChip label={tInfo("allTeams")} />;
  return (
    <ScrollableRow>
      {teamCodes.map((code) => (
        <TeamFlag key={code} code={code} team={teamsByCode.get(code)} />
      ))}
    </ScrollableRow>
  );
}

function TeamFlag({ code, team }: { code: string; team: Team | undefined }) {
  if (!team?.flag_url) {
    return <span className="inline-flex shrink-0 items-center rounded-xs bg-muted px-1 text-2xs font-semibold text-foreground">{code}</span>;
  }
  return <Image src={team.flag_url} alt={code} title={code} width={20} height={14} className="h-3.5 w-5 shrink-0 rounded-xs object-cover" />;
}

function Stat({ label, value, unit, className }: { label: string; value: string; unit?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1 px-4 py-2.5 leading-tight", className)}>
      <span className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-heading text-lg font-semibold tabular-nums">
        {value}
        {unit ? <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span> : null}
      </span>
    </div>
  );
}
