"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { GroupTable } from "@/features/standings/components/GroupTable";
import { QualificationLegend } from "@/features/standings/components/QualificationLegend";
import { groupAndEnrichStandings } from "@/features/standings/lib/groupStandings";
import type { StandingRow } from "@/features/standings/types/standings.types";
import { Link } from "@/i18n/navigation";
import type { GroupCode } from "@/shared/types/wcp.types";

import { CardReveal } from "./CardReveal";

type Props = {
  rows: StandingRow[];
  // Group to feature first (the next match's group, or the user's champion's group).
  preferredGroup: GroupCode | null;
  delay?: number;
};

// Scope the page accent to green inside this card so it mirrors the Standings
// view (which is green-accented) regardless of the dashboard's purple accent.
const GREEN_ACCENT = {
  "--page-accent": "var(--wcp-green)",
  "--page-accent-strong": "var(--wcp-green-strong)",
  "--page-accent-soft": "var(--wcp-green-soft)",
  "--page-accent-300": "var(--color-lime-300)",
} as React.CSSProperties;

// Group standings snapshot — reuses the Standings view's GroupTable + legend so
// the stats and styling match, with prev/next chevrons to cycle groups.
export function GroupStandingsCard({ rows, preferredGroup, delay }: Props) {
  const t = useTranslations("standings");
  const tDash = useTranslations("dashboard.standings");

  const groups = useMemo(() => groupAndEnrichStandings(rows), [rows]);
  const initialIndex = Math.max(
    0,
    groups.findIndex((g) => g.group_code === preferredGroup)
  );
  const [index, setIndex] = useState(initialIndex);

  if (groups.length === 0) return null;

  const safeIndex = ((index % groups.length) + groups.length) % groups.length;
  const group = groups[safeIndex];
  const cycle = (step: number) => setIndex((i) => i + step);

  return (
    <section className="flex flex-1 flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold">{tDash("heading")}</h2>
        <p className="text-xs text-muted-foreground">{tDash("subtitle")}</p>
      </div>
      <CardReveal bare delay={delay} className="opacity-0 flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div style={GREEN_ACCENT} className="flex flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <ChevronButton aria-label={tDash("prevGroup")} onClick={() => cycle(-1)}>
                <ChevronLeft className="size-4" aria-hidden />
              </ChevronButton>
              <div className="flex items-baseline gap-2">
                <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("groupLabel")}</span>
                <span className="text-xl font-bold leading-none text-page-accent">{group.group_code}</span>
              </div>
              <ChevronButton aria-label={tDash("nextGroup")} onClick={() => cycle(1)}>
                <ChevronRight className="size-4" aria-hidden />
              </ChevronButton>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-2xs font-medium uppercase tracking-wider text-muted-foreground sm:inline">
                {group.matchday === 0 ? t("matchdayNotStarted") : t("matchday", { current: group.matchday, total: group.total_matchdays })}
              </span>
              <Link
                href="/standings"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-page-accent-strong transition-colors hover:text-page-accent hover:underline"
              >
                {tDash("viewAll")}
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </div>
          </header>
          <div className="flex-1 overflow-x-auto px-4">
            <GroupTable rows={group.rows} groupPicks={null} />
          </div>
          <QualificationLegend />
        </div>
      </CardReveal>
    </section>
  );
}

function ChevronButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      {...props}
    >
      {children}
    </button>
  );
}
