"use client";

import { useTranslations } from "next-intl";

import { Card } from "@/shared/components/ui/card";

import type { PickStats } from "../lib/computePickStats";

import { PickProgressRadial } from "./PickProgressRadial";

type Props = {
  stats: PickStats;
};

export function PickProgressCard({ stats }: Props) {
  const t = useTranslations("schedule.progress");

  return (
    <Card size="sm" className="flex-row items-center gap-4 px-4">
      <PickProgressRadial picked={stats.picked} missed={stats.missed} total={stats.total} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="font-heading text-2xl leading-none font-semibold tabular-nums">
          {stats.picked + stats.missed} / {stats.total}
        </div>
        <div className="text-sm text-muted-foreground">{t("label")}</div>
        <div className="mt-2 flex items-center gap-2.5 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-page-accent tabular-nums">
            <span aria-hidden className="size-2 rounded-full bg-page-accent" />
            {t("picked", { count: stats.picked })}
          </span>
          {stats.missed > 0 && (
            <>
              <span aria-hidden className="h-3 w-px bg-border" />
              <span className="flex items-center gap-1.5 text-muted-foreground tabular-nums">
                <span aria-hidden className="size-2 rounded-full bg-missed-track" />
                {t("missed", { count: stats.missed })}
              </span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
