"use client";

import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";

type Props = {
  completed: number;
  total: number;
  label: string;
  className?: string;
};

/**
 * Right-rail status block rendered under the action buttons in the desktop
 * header. Same shape across all three steps so the eye lands in the same place
 * regardless of which step is active: a `count / total` label, then the bar.
 *
 * Desktop-only — mobile relies on the per-screen counters inside each step
 * (group cards, "X / 8 selected" line, per-stage CTA helper text).
 */
export function PickemsHeaderProgress({ completed, total, label, className }: Props) {
  const percent = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
  return (
    <div className={cn("hidden flex-col items-end gap-1 lg:flex", className)}>
      <p className="text-sm font-medium text-foreground tabular-nums">{label}</p>
      <Progress value={percent} className="h-1.5 w-44 *:data-[slot=progress-indicator]:bg-page-accent" />
    </div>
  );
}
