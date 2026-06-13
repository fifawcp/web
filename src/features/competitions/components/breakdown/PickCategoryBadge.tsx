import { Check, Minus, Sparkles, X, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import type { PickCategory } from "../../lib/computeMatchBreakdown";

// Colours mirror the guest dashboard's pick demo: exact = green (best),
// winner = lime (partial), miss = red, none = muted. Exported so the member
// dialog's score chip reads in the same colours as this verdict key.
export const CATEGORY_TONE: Record<"exact" | "winner" | "miss" | "none", string> = {
  exact: "bg-green-500/10 text-green-700 ring-1 ring-green-500/20 dark:text-green-400",
  winner: "bg-lime-400/15 text-lime-700 ring-1 ring-lime-500/25 dark:text-lime-400",
  miss: "bg-red-500/10 text-red-700 ring-1 ring-red-500/20 dark:text-red-400",
  none: "bg-muted text-muted-foreground",
};

const ICON: Record<keyof typeof CATEGORY_TONE, LucideIcon> = {
  exact: Sparkles,
  winner: Check,
  miss: X,
  none: Minus,
};

type Props = {
  category: PickCategory;
  points?: number;
  // Colour + points only (no icon/label) — leans on the scoring key to read.
  compact?: boolean;
  className?: string;
};

// `pending` (locked, not finished) renders nothing — there's no verdict yet.
export function PickCategoryBadge({ category, points, compact = false, className }: Props) {
  const t = useTranslations("competitions.breakdown.category");
  if (category === "pending") return null;

  const Icon = ICON[category];
  const tone = CATEGORY_TONE[category];

  if (compact) {
    const content = category === "none" ? "—" : points && points > 0 ? `+${points}` : "0";
    return (
      <span className={cn("inline-flex min-w-7 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums", tone, className)}>
        {content}
      </span>
    );
  }

  const showPoints = (category === "exact" || category === "winner") && points != null && points > 0;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", tone, className)}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {t(category)}
      {showPoints ? <span className="font-semibold tabular-nums">+{points}</span> : null}
    </span>
  );
}
