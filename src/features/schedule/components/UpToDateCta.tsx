"use client";

import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/shared/components/ui/card";
import { formatTimeUntil } from "@/shared/lib/dates";

import { useNow } from "../hooks/useNow";

type Props = {
  nextMatchAt: string | null;
};

export function UpToDateCta({ nextMatchAt }: Props) {
  const t = useTranslations("schedule.upToDate");
  const now = useNow();

  const target = useMemo(() => (nextMatchAt ? new Date(nextMatchAt) : null), [nextMatchAt]);
  const timeUntil = target ? formatTimeUntil(now, target) : null;

  if (!nextMatchAt || !timeUntil) return null;

  return (
    <Card size="sm" className="flex-row items-center gap-3 px-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
        <CheckCircle2 className="size-5" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="text-sm font-semibold">{t("title")}</div>
        <div className="text-xs text-muted-foreground">{t("nextMatch", { time: timeUntil })}</div>
      </div>
    </Card>
  );
}
