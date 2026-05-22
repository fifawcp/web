"use client";

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type Props = {
  completed: number;
  total: number;
  label: string;
  helperText?: string;
  helperTone?: "ready";
  className?: string;
};

/**
 * Right-rail status block rendered under the action buttons in the desktop
 * header. Fills the rail width so the bar lines up edge-to-edge with the
 * buttons above it. Shows the same helper text the mobile CTA bar surfaces, so
 * the prereq state ("All set", "5 of 12 locked", etc.) reads at a glance on
 * both layouts.
 */
export function PickemsHeaderProgress({ completed, total, label, helperText, helperTone, className }: Props) {
  const percent = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
  return (
    <div className={cn("flex flex-col items-stretch gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        {helperText ? (
          <p className={cn("flex min-w-0 items-center gap-1.5 text-xs font-medium", helperTone === "ready" ? "text-page-accent-strong" : "text-muted-foreground")}>
            {helperTone === "ready" && <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />}
            <span className="truncate">{helperText}</span>
          </p>
        ) : (
          <span />
        )}
        <p className="shrink-0 text-sm font-medium text-foreground tabular-nums">{label}</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-page-accent transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
