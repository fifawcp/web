"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, CircleDashed, GripVertical, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";

import type { RankedTeam } from "../types/pickems.types";

type Props = {
  team: RankedTeam;
  position: number;
  locale: string;
  disabled?: boolean;
};

export function GroupTeamRow({ team, position, locale, disabled }: Props) {
  const t = useTranslations("pickems.groups.badges");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: team.fifa_code,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const badge = badgeFor(position);
  // Muted fill de-emphasizes the eliminated slot; advancing rows (1st, 2nd, 3rd)
  // stay on the default card surface so they read as the "alive" set.
  const rowBgClass = badge === "out" ? "bg-muted" : "bg-card";

  const positionCircleClass =
    badge === "qualify" || badge === "third" ? "border-page-accent bg-card text-page-accent-strong" : "border-border bg-card text-muted-foreground";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border px-2.5 py-2 outline-none transition-shadow select-none",
        rowBgClass,
        !disabled && "touch-none cursor-grab focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
        isDragging && "z-10 shadow-md"
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground" aria-hidden>
        <GripVertical className="size-4" />
      </span>

      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs tabular-nums", positionCircleClass)} aria-hidden>
        {position}
      </span>

      <div className="shrink-0 overflow-hidden rounded-xs ring-1 ring-border/60">
        <Image src={team.flag_url} alt="" width={36} height={24} sizes="36px" className="h-6 w-9 object-cover" />
      </div>

      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{getTeamName(team, locale)}</span>

      <span className="flex shrink-0 justify-end">{badge && <PositionBadge variant={badge} label={t(badge)} />}</span>
    </div>
  );
}

type BadgeVariant = "qualify" | "third" | "out";

function badgeFor(position: number): BadgeVariant | null {
  if (position === 1 || position === 2) return "qualify";
  if (position === 3) return "third";
  if (position === 4) return "out";
  return null;
}

/**
 * Three-tier visual hierarchy in the data-accent palette — no containers,
 * just the icon + colour. Outline/filled circles competed with the row's
 * own position-number circle on the left and inverted the hierarchy.
 *
 *  - qualify (1st/2nd): Check, strong accent      → "advances directly"
 *  - third (3rd):       CircleDashed, accent      → "pending the best-third tiebreak"
 *  - out (4th):         X, muted                  → "didn't make it"
 *
 * `aria-label` carries the localized text so screen readers still
 * announce "Qualifies" / "Third" / "Out" despite the visual being icon-only.
 */
function PositionBadge({ variant, label }: { variant: BadgeVariant; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-flex size-6 items-center justify-center">
      {variant === "qualify" && <Check className="size-4 text-page-accent-strong" aria-hidden />}
      {variant === "third" && <CircleDashed className="size-4 text-page-accent-strong" aria-hidden />}
      {variant === "out" && <X className="size-3.5 text-muted-foreground/70" aria-hidden />}
    </span>
  );
}
