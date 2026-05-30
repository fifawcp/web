"use client";

import { ArrowLeft, CheckCircle2, Loader2, RotateCcw, Save } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type Props = {
  /** Awards still without a pick (0 = all four chosen). */
  remaining: number;
  canReset: boolean;
  isSaving: boolean;
  /** When locked the bar keeps only the Back link — no editing controls. */
  isLocked: boolean;
  onReset: () => void;
  onSave: () => void;
};

/**
 * Top command bar: back to pickems on the left; status + reset + save on the
 * right. The Back link renders in every state (so there's always a way out,
 * even when the awards are locked); the editing controls are hidden once
 * locked.
 */
export function AwardsActionBar({ remaining, canReset, isSaving, isLocked, onReset, onSave }: Props) {
  const t = useTranslations("awards");
  const allChosen = remaining === 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <Button asChild variant="outline" size="sm" className="gap-1.5 sm:w-fit">
        <Link href="/pickems">
          <ArrowLeft className="size-4" />
          {t("backToPickems")}
        </Link>
      </Button>

      {!isLocked && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <p className={cn("flex items-center gap-1.5 text-sm", allChosen ? "text-page-accent-strong" : "text-muted-foreground")}>
            {allChosen && <CheckCircle2 className="size-4 shrink-0" aria-hidden />}
            {t("remaining", { n: remaining })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onReset} disabled={!canReset || isSaving} className="gap-1.5">
              <RotateCcw className="size-3.5" />
              {t("resetAll")}
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving} className="gap-1.5 bg-page-accent text-white hover:bg-page-accent/90 sm:min-w-32">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-3.5" />}
              {isSaving ? t("saving") : t("save")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
