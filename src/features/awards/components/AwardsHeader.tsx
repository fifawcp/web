"use client";

import { Lock, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { formatShortDate } from "@/shared/lib/dates";

import { AWARD_POINTS } from "../lib/awards";

type Props = {
  completed: number;
  total: number;
  locksAt: Date;
  isLocked: boolean;
};

/** Awards page header — eyebrow, title, intro, and compact PICKED / LOCKS meta pills. */
export function AwardsHeader({ completed, total, locksAt, isLocked }: Props) {
  const t = useTranslations("awards");
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <span className="text-2xs font-semibold uppercase tracking-[0.18em] text-page-accent-strong">{t("eyebrow")}</span>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
        {/* Once locked the page is read-only, so the framing shifts from
            "predict the honors" to "review the winners you picked". */}
        <p className="max-w-xl text-sm text-muted-foreground">{t(isLocked ? "subtitleLocked" : "subtitle", { points: AWARD_POINTS })}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <MetaPill icon={<Trophy className="size-3.5 text-page-accent-strong" />} label={t("picked")} value={`${completed} / ${total}`} />
        {/* Date-only (no time) via the shared helper, so it matches the
            tournament-start date shown on the dashboard. The config date is
            midnight UTC, so rendering a time would only expose a timezone
            artifact (e.g. "10 Jun, 19:00" in a −5 zone). */}
        <MetaPill icon={<Lock className="size-3.5" />} label={t(isLocked ? "lockedLabel" : "locks")} value={formatShortDate(locksAt, locale)} />
      </div>
    </div>
  );
}

function MetaPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
      {icon}
      <div className="flex flex-col leading-none">
        <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="mt-0.5 text-sm font-bold tabular-nums whitespace-nowrap">{value}</span>
      </div>
    </div>
  );
}
