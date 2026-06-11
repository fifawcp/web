"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import type { BracketViewMode } from "../types/bracket.types";

const MODES: readonly BracketViewMode[] = ["results", "compare"];

type Props = {
  view: BracketViewMode;
  onChange: (next: BracketViewMode) => void;
};

/**
 * Segmented control switching the bracket between the user's predicted tree and
 * the predicted-vs-actual comparison. Presentational — the view owns the
 * URL-backed state via `useBracketCompareView`. Mirrors the Standings
 * `CompareToggle`.
 */
export function CompareToggle({ view, onChange }: Props) {
  const t = useTranslations("bracket.compare");

  return (
    <div role="group" aria-label={t("label")} className="flex rounded-md bg-muted p-0.5">
      {MODES.map((mode) => {
        const isActive = mode === view;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors",
              isActive ? "bg-background text-page-accent shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(mode)}
          </button>
        );
      })}
    </div>
  );
}
