"use client";

import { useLocale, useTranslations } from "next-intl";

import { Card } from "@/shared/components/ui/card";
import { formatShortDate } from "@/shared/lib/dates";

import { useCountdown } from "../hooks/useCountdown";
import { TOURNAMENT_START_DATE } from "../lib/tournamentConfig";

type CountdownUnitProps = {
  value: number;
  label: string;
};

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2 min-w-14">
      <span className="font-heading text-3xl font-bold tabular-nums leading-none" suppressHydrationWarning>
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

export function CountdownCard() {
  const t = useTranslations("dashboard.guest.countdown");
  const locale = useLocale();
  const countdown = useCountdown(TOURNAMENT_START_DATE);

  if (countdown.isExpired) {
    return null;
  }

  return (
    <Card size="sm" className="bg-card px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("tournamentBegins")}</span>
        <span className="text-xs text-muted-foreground" suppressHydrationWarning>
          {formatShortDate(TOURNAMENT_START_DATE, locale)}
        </span>
      </div>
      <div className="flex items-center justify-center divide-x divide-border">
        <CountdownUnit value={countdown.days} label={t("days")} />
        <CountdownUnit value={countdown.hours} label={t("hours")} />
        <CountdownUnit value={countdown.minutes} label={t("minutes")} />
        <CountdownUnit value={countdown.seconds} label={t("seconds")} />
      </div>
    </Card>
  );
}
