import type { ComponentType } from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  value: string;
  label: string;
  className?: string;
};

// Horizontal stat — an accent icon beside a value over a muted label. Shared by the
// competition header and the member predictions dialog.
export function StatPill({ icon: Icon, value, label, className }: Props) {
  return (
    <div className={cn("flex items-center justify-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 sm:justify-start sm:py-2", className)}>
      <Icon className="size-4 shrink-0 text-page-accent-strong" aria-hidden />
      <span className="flex flex-col leading-tight">
        <span className="font-heading text-base font-semibold tabular-nums">{value}</span>
        <span className="text-2xs font-medium whitespace-nowrap text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}
