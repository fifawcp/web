import { getTranslations } from "next-intl/server";

import { cn } from "@/shared/lib/utils";

import { computeGroupComparison } from "../lib/comparison";
import type { GroupStandings, PickIndex } from "../types/standings.types";

import { GroupTable } from "./GroupTable";
import { QualificationLegend } from "./QualificationLegend";

type Props = {
  group: GroupStandings;
  pickIndex: PickIndex | null;
};

export async function GroupCard({ group, pickIndex }: Props) {
  const t = await getTranslations("standings");
  const groupPicks = pickIndex?.get(group.group_code) ?? null;
  const groupComparison = groupPicks ? computeGroupComparison(group.rows, groupPicks) : null;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card" aria-label={`${t("groupLabel")} ${group.group_code}`}>
      <header className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("groupLabel")}</span>
          <span className="text-xl font-bold leading-none">{group.group_code}</span>
        </div>
        <div className="flex items-center gap-2">
          {groupComparison && (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-2xs font-semibold tabular-nums",
                groupComparison.isPerfect ? "border-lime-500/30 bg-lime-500/15 text-lime-700 dark:text-lime-400" : "border-border bg-muted text-muted-foreground"
              )}
              aria-label={t("groupAccuracyLabel", { correct: groupComparison.correct, total: groupComparison.total })}
            >
              {groupComparison.isPerfect ? "★ " : ""}
              {groupComparison.correct}/{groupComparison.total}
            </span>
          )}
          <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("matchday", { current: group.matchday, total: group.total_matchdays })}
          </span>
        </div>
      </header>
      <div className="overflow-x-auto">
        <GroupTable rows={group.rows} groupPicks={groupPicks} />
      </div>
      <QualificationLegend />
    </article>
  );
}
