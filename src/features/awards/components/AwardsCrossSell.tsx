import { ArrowRight, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";

type Props = {
  /** Tournament locked — the callout flips from "pick" to "see your picks". */
  isLocked?: boolean;
};

/**
 * Compact "bonus awards" callout. Rendered inside pickems (and reusable
 * elsewhere) as a secondary entry point into `/pickems/awards`. Amber-tinted trophy
 * keeps it visually distinct from the host page's own accent so it reads as a
 * separate, optional bonus rather than another pickems step.
 */
export function AwardsCrossSell({ isLocked = false }: Props) {
  const t = useTranslations("awards.crossSell");

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300">
          <Trophy className="size-5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold leading-tight">{t("title")}</span>
          <span className="text-xs leading-snug text-muted-foreground">{t(isLocked ? "descriptionLocked" : "description")}</span>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5 sm:self-auto">
        <Link href="/pickems/awards">
          {t(isLocked ? "ctaLocked" : "cta")}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
