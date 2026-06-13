import { useTranslations } from "next-intl";

import type { UserScorePick } from "@/features/schedule/types/schedule.types";
import { cn } from "@/shared/lib/utils";

type Props = {
  pick: UserScorePick | null;
  className?: string;
};

// A member's predicted score, or a muted "no prediction" placeholder.
export function PredictionScore({ pick, className }: Props) {
  const t = useTranslations("competitions.breakdown");
  if (!pick) return <span className={cn("text-xs text-muted-foreground", className)}>{t("noPick")}</span>;

  return (
    <span className={cn("font-heading text-base font-bold tabular-nums", className)}>
      {pick.home_score}
      <span className="px-1 font-normal text-muted-foreground">&minus;</span>
      {pick.away_score}
    </span>
  );
}
