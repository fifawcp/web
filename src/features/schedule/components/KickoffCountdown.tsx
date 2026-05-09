"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import { useNow } from "../hooks/useNow";
import { formatTimeUntil } from "../lib/formatTimeUntil";

type Props = {
  kickoffAt: string;
};

export function KickoffCountdown({ kickoffAt }: Props) {
  const t = useTranslations("schedule.card");
  const now = useNow();

  // memoize the target date to avoid re-calculating it on every render
  const target = useMemo(() => new Date(kickoffAt), [kickoffAt]);
  const text = formatTimeUntil(now, target);

  if (!text) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3.5 shrink-0" aria-hidden />
      <span className="max-sm:hidden">{t("closesIn", { time: text })}</span>
      <span className="sm:hidden">{text}</span>
    </span>
  );
}
