import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export type StatTone = "default" | "winner" | "exact" | "miss";

const TONE: Record<StatTone, string> = {
  default: "text-foreground",
  winner: "text-lime-600 dark:text-lime-400",
  exact: "text-green-600 dark:text-green-400",
  miss: "text-red-600 dark:text-red-400",
};

type Props = {
  value: ReactNode;
  label: string;
  tone?: StatTone;
  className?: string;
};

// Vertical stat tile — a big value over a muted label inside a soft card. Shared
// by the prediction-reveal surfaces (match breakdown recap + member detail header).
// The label reserves two lines so values stay aligned across a row even when one
// label wraps.
export function StatCard({ value, label, tone = "default", className }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1 rounded-lg bg-muted px-3 py-3 text-center sm:py-4", className)}>
      <span className={cn("font-heading text-xl leading-none font-semibold tabular-nums sm:text-2xl", TONE[tone])}>{value}</span>
      <span className="block min-h-8 w-full text-xs leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}
