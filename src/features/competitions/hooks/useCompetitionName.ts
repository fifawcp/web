"use client";

import { useTranslations } from "next-intl";

import { resolveCompetitionNameKey } from "../lib/competitionName";

// Returns a resolver that localizes seeded default competition names (e.g. "All matches" →
// "Full tournament" / "Torneo completo") while leaving user-created names as-is.
export function useCompetitionName() {
  const t = useTranslations("competitions.defaultNames");
  return (name: string) => {
    const key = resolveCompetitionNameKey(name);
    return key ? t(key) : name;
  };
}
