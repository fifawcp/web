"use client";

import { CalendarClock, CheckCircle2, type LucideIcon, Target } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

import type { PickStats } from "../lib/computePickStats";

import { PickProgressRadial } from "./PickProgressRadial";

type Props = {
  stats: PickStats;
};

const ACCENT_ICON = "bg-page-accent-soft text-page-accent-strong";

export function PickProgressPanel({ stats }: Props) {
  const t = useTranslations("schedule.progress");
  const tBoard = useTranslations("schedule.board");

  const available = stats.picked + stats.missed + stats.pendingAll;

  return (
    <Card size="sm" className="flex-row items-center gap-4 px-4 lg:gap-5 lg:px-5 lg:py-3">
      <div className="flex shrink-0 items-center gap-4 lg:min-w-64 xl:min-w-80">
        <PickProgressRadial picked={stats.picked} missed={stats.missed} total={available} />
        <div className="flex flex-col gap-0.5">
          <div className="font-heading text-2xl leading-none font-semibold tabular-nums">
            {stats.picked + stats.missed} / {available}
          </div>
          <div className="text-sm text-muted-foreground">{t("label")}</div>
          <div className="mt-1.5 flex items-center gap-2.5 text-xs">
            <span className="flex items-center gap-1.5 font-medium whitespace-nowrap text-page-accent tabular-nums">
              <span aria-hidden className="size-2 rounded-full bg-page-accent" />
              {t("picked", { count: stats.picked })}
            </span>
            {stats.missed > 0 && (
              <>
                <span aria-hidden className="h-3 w-px bg-border" />
                <span className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground tabular-nums">
                  <span aria-hidden className="size-2 rounded-full bg-missed-track" />
                  {t("missed", { count: stats.missed })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hidden h-20 w-px shrink-0 bg-border lg:block" />

      <div className="hidden flex-1 items-center lg:flex">
        <StatTile className="flex-1 px-3" icon={CalendarClock} value={stats.pendingToday} label={tBoard("today")} iconClassName={ACCENT_ICON} />
        <div className="h-20 w-px shrink-0 bg-border" />
        <StatTile className="flex-1 px-3" icon={Target} value={stats.correctScores} label={tBoard("correctScore")} iconClassName={ACCENT_ICON} />
        <div className="h-20 w-px shrink-0 bg-border" />
        <StatTile className="flex-1 px-3" icon={CheckCircle2} value={stats.correctOutcomes} label={tBoard("correctOutcome")} iconClassName={ACCENT_ICON} />
      </div>
    </Card>
  );
}

type TileProps = {
  icon: LucideIcon;
  value: number;
  label: string;
  iconClassName?: string;
  className?: string;
};

function StatTile({ icon: Icon, value, label, iconClassName, className }: TileProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground", iconClassName)}>
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="font-heading text-xl leading-none font-semibold tabular-nums">{value}</div>
        <div className="line-clamp-2 text-xs leading-tight text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
