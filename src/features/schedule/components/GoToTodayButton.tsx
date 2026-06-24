"use client";

import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

type Props = {
  onPress: () => void;
  className?: string;
};

// "Go to today" — scrolls the schedule to the current day's matches. Styled as a solid
// page-accent CTA so it stands out against the neutral filter chips, and shares the
// scroll-into-view behaviour of the pending-picks CTA.
export function GoToTodayButton({ onPress, className }: Props) {
  const t = useTranslations("schedule");

  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-page-accent-strong px-4 text-sm font-semibold text-white shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-page-accent-soft",
        className
      )}
    >
      <CalendarDays className="size-4 shrink-0" aria-hidden />
      {t("goToToday")}
    </button>
  );
}
