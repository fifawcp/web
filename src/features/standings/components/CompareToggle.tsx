"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import type { StandingsViewMode } from "../types/standings.types";

const MODES: readonly StandingsViewMode[] = ["normal", "compare"];

type Props = {
  view: StandingsViewMode;
  onChange: (next: StandingsViewMode) => void;
};

/**
 * Segmented control that switches the standings between the real results and
 * the user's pickem comparison. Presentational — the view owns the URL-backed
 * state via `useCompareView`. Mirrors the ThemeSwitch / LanguageSwitch pattern.
 */
export function CompareToggle({ view, onChange }: Props) {
  const t = useTranslations("standings.compare");

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
