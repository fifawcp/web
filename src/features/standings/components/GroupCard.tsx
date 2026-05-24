"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import { computeGroupComparison } from "../lib/comparison";
import type { GroupStandings, PickIndex } from "../types/standings.types";

import { GroupTable } from "./GroupTable";
import { QualificationLegend } from "./QualificationLegend";

type Props = {
  group: GroupStandings;
  pickIndex: PickIndex | null;
};

// Empty pick map for groups the user hasn't locked: keeps the YOU column
// visible (every row renders the "not picked" pill) instead of collapsing
// the layout from card to card. Module-scoped so React sees a stable reference.
const EMPTY_PICKS: Map<string, number> = new Map();

export function GroupCard({ group, pickIndex }: Props) {
  const t = useTranslations("standings");
  // When `pickIndex` is non-null we're in compare mode; missing entries get
  // the empty map sentinel so each card stays in compare layout.
  const groupPicks = pickIndex === null ? null : (pickIndex.get(group.group_code) ?? EMPTY_PICKS);
  // Only score the badge when there's something to score — an empty pick map
  // (unlocked group) leaves the header clean while the rows still show "—".
  const groupComparison = groupPicks && groupPicks.size > 0 ? computeGroupComparison(group.rows, groupPicks) : null;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card" aria-label={`${t("groupLabel")} ${group.group_code}`}>
      <header className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("groupLabel")}</span>
          <span className="text-xl font-bold leading-none text-page-accent">{group.group_code}</span>
        </div>
        <div className="flex items-center gap-2">
          {groupComparison && (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-2xs font-semibold tabular-nums",
                groupComparison.isPerfect ? "border-lime-500/30 bg-lime-500/15 text-lime-700 dark:text-lime-400" : "border-border bg-muted text-muted-foreground"
              )}
              aria-label={t("groupSummaryLabel", {
                correct: groupComparison.correct,
                total: groupComparison.total,
                points: groupComparison.points,
                max: groupComparison.maxPoints,
              })}
            >
              {groupComparison.isPerfect ? "★ " : ""}
              {t("groupBadgeText", { correct: groupComparison.correct, total: groupComparison.total, points: groupComparison.points })}
            </span>
          )}
          {group.matchday === 0 ? (
            <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("matchdayNotStarted")}</span>
          ) : (
            <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("matchday", { current: group.matchday, total: group.total_matchdays })}
            </span>
          )}
        </div>
      </header>
      <div className="overflow-x-auto">
        <GroupTable rows={group.rows} groupPicks={groupPicks} />
      </div>
      <QualificationLegend />
    </article>
  );
}
