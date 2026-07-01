"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import type { BracketViewMode } from "../types/bracket.types";

type Props = {
  mode: BracketViewMode;
  onChange: (next: BracketViewMode) => void;
  /** `compare` is only offered when the user can compare (auth + tournament started). */
  canCompare: boolean;
};

/**
 * Segmented control switching the bracket between Results, Compare (gated), and
 * the interactive Simulator. Presentational — the page owns the URL-backed state
 * via `useBracketViewMode`. Mirrors the Standings segmented toggle.
 */
export function BracketModeToggle({ mode, onChange, canCompare }: Props) {
  const t = useTranslations("bracket.compare");

  const modes: BracketViewMode[] = canCompare ? ["results", "compare", "simulate"] : ["results", "simulate"];

  return (
    <div role="group" aria-label={t("label")} className="flex rounded-md bg-muted p-0.5">
      {modes.map((m) => {
        const isActive = m === mode;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors",
              isActive ? "bg-background text-page-accent shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(m)}
          </button>
        );
      })}
    </div>
  );
}
