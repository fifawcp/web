"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import type { RankedTeam, ResolvedGroupPick } from "../types/pickems.types";

import { GroupTeamRow } from "./GroupTeamRow";

type Props = {
  group: ResolvedGroupPick;
  onReorder: (groupCode: ResolvedGroupPick["group_code"], next: RankedTeam[]) => void;
  disabled?: boolean;
  /** Mobile-only open state. Tablet (md+) and desktop always show the team list. */
  open: boolean;
  onToggle: () => void;
};

export function GroupCard({ group, onReorder, disabled, open, onToggle }: Props) {
  const t = useTranslations("pickems.groups");
  const locale = useLocale();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const teamIds = group.teams.map((team) => team.fifa_code);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = teamIds.indexOf(String(active.id));
    const to = teamIds.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const reordered = arrayMove(group.teams, from, to).map((team, idx) => ({ ...team, position: idx + 1 }));
    onReorder(group.group_code, reordered);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left md:pointer-events-none md:cursor-default"
        aria-expanded={open}
      >
        <h3 className="shrink-0 text-base font-semibold tracking-tight text-foreground">{t("groupLabel", { code: group.group_code })}</h3>

        <div className={cn("grid min-w-0 flex-1 grid-cols-4 items-center gap-1.5 pl-3 md:hidden", open && "invisible")}>
          {group.teams.map((team, idx) => (
            <span key={team.fifa_code} className="flex min-w-0 items-center justify-center gap-1 font-mono text-2xs">
              <span className="text-muted-foreground">{idx + 1}</span>
              <span className="font-semibold uppercase tracking-wider text-foreground/85">{team.fifa_code}</span>
            </span>
          ))}
        </div>

        <span className="hidden font-mono text-2xs uppercase tracking-wider text-muted-foreground md:ml-auto md:inline">{t("dragToOrder")}</span>

        <ChevronDown className={cn("ml-2 size-4 shrink-0 text-muted-foreground transition-transform md:hidden", open && "rotate-180")} aria-hidden />
      </button>

      <div className={cn("border-t border-border bg-zinc-50 dark:bg-zinc-900/40 md:block", !open && "hidden")}>
        <DndContext id={`pickem-group-${group.group_code}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={teamIds} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1 px-3 py-3">
              {group.teams.map((team, idx) => (
                <li key={team.fifa_code}>
                  <GroupTeamRow team={team} position={idx + 1} locale={locale} disabled={disabled} />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
