"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import type { GroupCode } from "@/shared/types/wcp.types";

import type { PickemProgress, PickemStep, RankedTeam, ResolvedGroupPick, UserPickem } from "../types/pickems.types";

import { GroupCard } from "./GroupCard";
import { PickemsCTABar, type CTAAction } from "./PickemsCTABar";
import { PickemsHeader } from "./PickemsHeader";
import { PickemsHeaderActions } from "./PickemsHeaderActions";
import { PickemsHeaderProgress } from "./PickemsHeaderProgress";
import { PickemsStepper } from "./PickemsStepper";
import { PickemsTipsBanner } from "./PickemsTipsBanner";

type Props = {
  data: UserPickem;
  step: PickemStep;
  onStep: (step: PickemStep) => void;
  progress: PickemProgress;
  canNavigateTo: (step: PickemStep) => boolean;
  onReorder: (groupCode: GroupCode, next: RankedTeam[]) => void;
  onSaveDraft: () => void;
  onContinue: () => void;
  isSaving: boolean;
};

export function StepGroups({ data, step, onStep, progress, canNavigateTo, onReorder, onSaveDraft, onContinue, isSaving }: Props) {
  const t = useTranslations("pickems");

  // Backend can return groups in any order; render them A → L.
  const groups = useMemo(() => sortGroups(data.group_picks), [data.group_picks]);

  // Open state lifted up so the "Expand all" toggle can drive every card.
  // On desktop the team list is always visible regardless of this state.
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(groups[0] ? [groups[0].group_code] : []));

  const allOpen = openGroups.size === groups.length;

  const toggleGroup = (code: GroupCode) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleAll = () => {
    setOpenGroups(allOpen ? new Set() : new Set(groups.map((g) => g.group_code)));
  };

  const action: CTAAction = data.is_locked ? { kind: "hidden" } : { kind: "continue", label: t("common.continueToStep2"), loading: isSaving, onClick: onContinue };
  const saveDraftFn = data.is_locked ? undefined : onSaveDraft;

  return (
    <section className="space-y-4 lg:space-y-6">
      <PickemsHeader
        step="groups"
        rightSlot={
          <>
            <PickemsHeaderActions action={action} onSaveDraft={saveDraftFn} />
            <PickemsHeaderProgress
              completed={progress.groups.completed}
              total={progress.groups.total}
              label={`${progress.groups.completed} / ${progress.groups.total}`}
            />
          </>
        }
      />

      <PickemsStepper current={step} progress={progress} onChange={onStep} canNavigateTo={canNavigateTo} />

      {!data.is_locked && <PickemsTipsBanner />}

      <div className="flex items-center justify-between pt-1 md:hidden">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{t("groups.sectionLabel")}</h3>
        <Button variant="outline" size="sm" onClick={toggleAll} className="min-w-32 cursor-pointer gap-1.5">
          <ArrowDownUp className="size-3.5" aria-hidden />
          {allOpen ? t("groups.collapseAll") : t("groups.expandAll")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {groups.map((group) => (
          <GroupCard
            key={group.group_code}
            group={group}
            onReorder={onReorder}
            disabled={data.is_locked}
            open={openGroups.has(group.group_code)}
            onToggle={() => toggleGroup(group.group_code)}
          />
        ))}
      </div>

      <PickemsCTABar action={action} onSaveDraft={saveDraftFn} />
    </section>
  );
}

function sortGroups(groups: ResolvedGroupPick[]): ResolvedGroupPick[] {
  return [...groups].sort((a, b) => a.group_code.localeCompare(b.group_code));
}
