"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useNow } from "@/features/schedule/hooks/useNow";
import { computeMatchUiState } from "@/features/schedule/lib/computeMatchUiState";
import type { Match } from "@/features/schedule/types/schedule.types";
import { Input } from "@/shared/components/ui/input";
import { formatShortDate } from "@/shared/lib/dates";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";

import { TeamFlag } from "./scopeBits";

type Props = {
  matches: Match[];
  value: number | null;
  onChange: (matchId: number) => void;
};

// Picks the single match a pool competition covers. Only still-open matches are selectable — a pool
// on a locked match has nothing left to predict.
export function PoolMatchPicker({ matches, value, onChange }: Props) {
  const t = useTranslations("competitions.create.match");
  const tStages = useTranslations("schedule.filters.stage");
  const locale = useLocale();
  const now = useNow();
  const [search, setSearch] = useState("");

  const selectable = useMemo(() => {
    // Only matches with a confirmed fixture (both teams known) and still open can be pooled.
    const open = matches.filter((m) => m.teams.home != null && m.teams.away != null && !computeMatchUiState(m, now).isLocked);
    return open.sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime());
  }, [matches, now]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return selectable;
    return selectable.filter((m) => {
      const names = [m.teams.home, m.teams.away].flatMap((team) => (team ? [getTeamName(team, locale), team.fifa_code] : []));
      return names.some((n) => n.toLowerCase().includes(q));
    });
  }, [selectable, search, locale]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-0.5">
          {filtered.map((match) => {
            const selected = match.id === value;
            const { home, away } = match.teams;
            return (
              <li key={match.id}>
                <button
                  type="button"
                  onClick={() => onChange(match.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full flex-col gap-2 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted sm:flex-row sm:items-center sm:gap-3",
                    selected ? "border-page-accent" : "border-border"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium sm:flex-1">
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                        selected ? "border-page-accent bg-page-accent text-white" : "border-input bg-card text-transparent"
                      )}
                    >
                      <Check className="size-3.5" />
                    </span>
                    <span className="flex min-w-0 flex-1 items-center gap-1.5">
                      <TeamFlag code={home?.fifa_code ?? "?"} team={home ?? undefined} />
                      <span className="truncate">{home ? getTeamName(home, locale) : "—"}</span>
                    </span>
                    <span className="shrink-0 font-mono text-2xs text-muted-foreground">{t("vs")}</span>
                    <span className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
                      <span className="truncate">{away ? getTeamName(away, locale) : "—"}</span>
                      <TeamFlag code={away?.fifa_code ?? "?"} team={away ?? undefined} />
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-2 pl-7 leading-tight sm:flex-col sm:items-end sm:justify-center sm:pl-0">
                    <span className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{tStages(match.stage_code)}</span>
                    <span className="text-2xs text-muted-foreground">{formatShortDate(new Date(match.kickoff_at), locale)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
