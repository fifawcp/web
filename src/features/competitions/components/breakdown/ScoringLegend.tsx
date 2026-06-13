import { useTranslations } from "next-intl";

import { MATCH_SCORE_EXACT, MATCH_SCORE_OUTCOME } from "@/shared/lib/scoring/matchScoring";
import { cn } from "@/shared/lib/utils";

import { PickCategoryBadge } from "./PickCategoryBadge";

// The "+5 / +2 / 0 / —" scoring key shared by the breakdown table and the member
// predictions dialog, so the compact verdict chips read the same everywhere.
export function ScoringLegend({ className }: { className?: string }) {
  const t = useTranslations("competitions.breakdown.members");
  const tCat = useTranslations("competitions.breakdown.category");

  return (
    <div className={cn("flex flex-col gap-2.5 rounded-lg border border-border bg-muted/40 p-3", className)}>
      <p className="text-2xs font-medium tracking-wider text-muted-foreground uppercase">{t("scoring")}</p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-muted-foreground sm:grid-cols-4">
        <li className="flex items-center gap-2">
          <PickCategoryBadge category="exact" points={MATCH_SCORE_EXACT} compact />
          {tCat("exact")}
        </li>
        <li className="flex items-center gap-2">
          <PickCategoryBadge category="winner" points={MATCH_SCORE_OUTCOME} compact />
          {tCat("winner")}
        </li>
        <li className="flex items-center gap-2">
          <PickCategoryBadge category="miss" compact />
          {tCat("miss")}
        </li>
        <li className="flex items-center gap-2">
          <PickCategoryBadge category="none" compact />
          {tCat("none")}
        </li>
      </ul>
    </div>
  );
}
