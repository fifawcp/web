"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import { formatTimeUntil } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/utils";

import type { CompetitionPickState } from "../lib/competitionPickStatus";

type Props = {
  pickState: CompetitionPickState;
  now: Date;
  className?: string;
};

// The lock timer shown in a card's subheader. Urgent (accent) while picks are open, muted once closed.
export function CompetitionCountdown({ pickState, now, className }: Props) {
  const t = useTranslations("competitions.card");
  const target = pickState.kind === "needs-pick" && pickState.countdownTarget ? pickState.countdownTarget : null;
  const remaining = useMemo(() => (target ? formatTimeUntil(now, new Date(target)) : null), [target, now]);

  if (pickState.kind === "closed") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-muted-foreground", className)}>
        <Clock className="size-3.5 shrink-0" aria-hidden />
        {t("closed")}
      </span>
    );
  }

  if (pickState.kind === "needs-pick" && remaining) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-page-accent-strong", className)}>
        <Clock className="size-3.5 shrink-0" aria-hidden />
        {t("closesIn", { time: remaining })}
      </span>
    );
  }

  return null;
}
