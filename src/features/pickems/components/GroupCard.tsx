"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, Lock, LockOpen } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import type { RankedTeam, ResolvedGroupPick } from "../types/pickems.types";

import { GroupTeamRow } from "./GroupTeamRow";

type Props = {
  group: ResolvedGroupPick;
  onReorder: (groupCode: ResolvedGroupPick["group_code"], next: RankedTeam[]) => void;
  /** Tournament-level lock (kickoff). Distinct from `group.locked`, which is the user's per-group confirm. */
  disabled?: boolean;
  onToggleLock: (groupCode: ResolvedGroupPick["group_code"]) => void;
  /** Mobile-only open state. Tablet (md+) and desktop always show the team list. */
  open: boolean;
  onToggle: () => void;
};

export function GroupCard({ group, onReorder, disabled, onToggleLock, open, onToggle }: Props) {
  const t = useTranslations("pickems.groups");
  const locale = useLocale();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const teamIds = group.teams.map((team) => team.fifa_code);
  const dragDisabled = disabled || group.locked;
  // Tournament locked → everything is final and scores regardless of the user's per-group
  // lock, so present every group as locked rather than leaving un-confirmed groups "open".
  const showAsLocked = group.locked || disabled;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = teamIds.indexOf(String(active.id));
    const to = teamIds.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const reordered = arrayMove(group.teams, from, to).map((team, idx) => ({ ...team, position: idx + 1 }));
    onReorder(group.group_code, reordered);
  };

  const handleLockClick = (event: React.MouseEvent) => {
    // Lock button lives inside the mobile drawer trigger button. Without stopping
    // propagation the parent toggle would collapse/expand the drawer on every lock click.
    event.stopPropagation();
    if (disabled) return;
    onToggleLock(group.group_code);
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card transition-colors", showAsLocked ? "border-page-accent/40 bg-page-accent-soft/25" : "border-border")}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left md:pointer-events-none md:cursor-default"
        aria-expanded={open}
      >
        {/* Fixed 62px on mobile so the team-code grid starts at the same x
            across every group; natural width on md+ where the grid is hidden. */}
        <h3 className="w-[62px] shrink-0 text-base font-semibold tracking-tight text-foreground md:w-auto">{t("groupLabel", { code: group.group_code })}</h3>

        <div className={cn("grid min-w-0 flex-1 grid-cols-4 items-center gap-1.5 pl-3 md:hidden", open && "invisible")}>
          {group.teams.map((team, idx) => (
            // Fixed 42px box (position + code), centered in its grid column, so
            // the pairs line up across groups regardless of per-glyph width.
            <span key={team.fifa_code} className="mx-auto flex w-[42px] items-center gap-1 font-mono text-2xs">
              <span className="text-muted-foreground">{idx + 1}</span>
              <span className="font-semibold uppercase tracking-wider text-foreground/85">{team.fifa_code}</span>
            </span>
          ))}
        </div>

        <span
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-pressed={showAsLocked}
          aria-label={t(showAsLocked ? "unlockAction" : "lockAction", { code: group.group_code })}
          aria-disabled={disabled}
          onClick={handleLockClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              if (!disabled) onToggleLock(group.group_code);
            }
          }}
          className={cn(
            "hidden md:ml-auto md:inline-flex md:size-7 md:shrink-0 md:cursor-pointer md:items-center md:justify-center md:rounded-md md:transition-colors md:pointer-events-auto",
            showAsLocked ? "md:bg-page-accent-soft md:text-page-accent-strong md:hover:bg-page-accent-soft/80" : "md:text-foreground md:hover:bg-muted",
            disabled && "md:cursor-not-allowed md:opacity-50 md:hover:bg-transparent"
          )}
        >
          {showAsLocked ? <Lock className="size-4" aria-hidden /> : <LockOpen className="size-4" strokeWidth={2.25} aria-hidden />}
        </span>

        <span
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-pressed={showAsLocked}
          aria-label={t(showAsLocked ? "unlockAction" : "lockAction", { code: group.group_code })}
          aria-disabled={disabled}
          onClick={handleLockClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              if (!disabled) onToggleLock(group.group_code);
            }
          }}
          className={cn(
            "ml-1 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors md:hidden",
            showAsLocked ? "bg-page-accent-soft text-page-accent-strong hover:bg-page-accent-soft/80" : "text-foreground hover:bg-muted",
            disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
          )}
        >
          {showAsLocked ? <Lock className="size-4" aria-hidden /> : <LockOpen className="size-4" strokeWidth={2.25} aria-hidden />}
        </span>

        <ChevronDown className={cn("ml-2 size-4 shrink-0 text-muted-foreground transition-transform md:hidden", open && "rotate-180")} aria-hidden />
      </button>

      <div className={cn("border-t border-border bg-zinc-50 dark:bg-zinc-900/40 md:block", !open && "hidden")}>
        <DndContext id={`pickem-group-${group.group_code}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={teamIds} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1 px-3 py-3">
              {group.teams.map((team, idx) => (
                <li key={team.fifa_code}>
                  <GroupTeamRow team={team} position={idx + 1} locale={locale} disabled={dragDisabled} />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
