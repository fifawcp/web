"use client";

import { useTranslations } from "next-intl";

import { Card } from "@/shared/components/ui/card";

import { TOURNAMENT_STATS } from "../lib/tournamentConfig";

type StatRowProps = {
  label: string;
  value: number;
};

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-heading text-2xl font-bold tabular-nums">{value}</span>
    </div>
  );
}

export function TournamentStatsCard() {
  const t = useTranslations("dashboard.guest.stats");

  return (
    <Card size="sm" className="bg-card px-4 py-4">
      <div className="flex flex-col">
        <div className="flex justify-between gap-4">
          <StatRow label={t("totalMatches")} value={TOURNAMENT_STATS.totalMatches} />
          <StatRow label={t("knockouts")} value={TOURNAMENT_STATS.knockoutMatches} />
        </div>
        <div className="flex justify-between gap-4">
          <StatRow label={t("groupMatches")} value={TOURNAMENT_STATS.groupMatches} />
          <StatRow label={t("teams")} value={TOURNAMENT_STATS.teams} />
        </div>
      </div>
    </Card>
  );
}
