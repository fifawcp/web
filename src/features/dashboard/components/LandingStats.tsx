import { Building2, CalendarDays, Globe, Users, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { TOURNAMENT_STATS } from "../lib/tournamentConfig";

// Honest "by the numbers" facts about World Cup 2026 — no fabricated user counts.
// 16 host cities / 3 host countries are real tournament facts.
const FACTS: { key: string; value: number; icon: LucideIcon }[] = [
  { key: "teams", value: TOURNAMENT_STATS.teams, icon: Users },
  { key: "matches", value: TOURNAMENT_STATS.totalMatches, icon: CalendarDays },
  { key: "cities", value: 16, icon: Building2 },
  { key: "countries", value: 3, icon: Globe },
];

export async function LandingStats() {
  const t = await getTranslations("dashboard.landing.stats");

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3">
        {FACTS.map((fact) => (
          <div key={fact.key} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
              <fact.icon className="size-4.5" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="font-heading text-2xl font-bold tabular-nums text-page-accent-strong">{fact.value}</span>
              <span className="truncate text-xs text-muted-foreground">{t(fact.key)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
