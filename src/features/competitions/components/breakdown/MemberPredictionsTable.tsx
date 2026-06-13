"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/shared/components/ui/input";
import { displayName } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import type { MemberPickRow, PickCategory } from "../../lib/computeMatchBreakdown";

import { PickCategoryBadge } from "./PickCategoryBadge";
import { PredictionScore } from "./PredictionScore";
import { ScoringLegend } from "./ScoringLegend";

type Filter = "all" | "hits" | "misses" | "exact";

const FILTERS: Filter[] = ["all", "hits", "misses", "exact"];

const MATCHES: Record<Filter, (category: PickCategory) => boolean> = {
  all: () => true,
  hits: (category) => category === "exact" || category === "winner",
  misses: (category) => category === "miss" || category === "none",
  exact: (category) => category === "exact",
};

const name = (row: MemberPickRow) => displayName(row.member.username, row.member.first_name, row.member.last_name);

// Members who made a prediction sort ahead of those who didn't (within a points tie).
const madePick = (row: MemberPickRow) => (row.pick != null ? 0 : 1);

// Rank order, matching the API's match-pick RANK() exactly so the breakdown rank stays
// in sync with the card preview + header position: points desc, then predictors before
// non-predictors, then earliest joiner, then user id. (For a single match, exact/correct
// tiebreaks are redundant with points.)
const byRank = (a: MemberPickRow, b: MemberPickRow) =>
  b.points - a.points || madePick(a) - madePick(b) || a.member.joined_at.localeCompare(b.member.joined_at) || a.member.user_id.localeCompare(b.member.user_id);

type Props = {
  rows: MemberPickRow[];
  currentUserId: string;
  finished: boolean;
  // Pick competitions double this table as the leaderboard, so it shows a rank.
  showRank?: boolean;
};

// Interactive comparison table: filter by verdict, search by member. For a pick
// competition it also carries the rank, replacing the standalone leaderboard.
export function MemberPredictionsTable({ rows, currentUserId, finished, showRank = false }: Props) {
  const t = useTranslations("competitions.breakdown.members");
  const tLb = useTranslations("competitions.leaderboard");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const ordered = useMemo(() => [...rows].sort(byRank), [rows]);
  const rankByUser = useMemo(() => new Map(ordered.map((row, index) => [row.member.user_id, index + 1])), [ordered]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = MATCHES[finished ? filter : "all"];
    return ordered
      .filter((row) => matches(row.category))
      .filter((row) => q === "" || name(row).toLowerCase().includes(q) || row.member.username.toLowerCase().includes(q));
  }, [ordered, filter, query, finished]);

  const colSpan = showRank ? 4 : 3;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
        {finished ? (
          <div role="group" aria-label={t("filterLabel")} className="-mx-1 flex gap-0.5 overflow-x-auto rounded-md bg-muted p-0.5 sm:mx-0">
            {FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
                className={cn(
                  "flex-1 rounded px-3 py-1.5 text-center text-xs font-medium whitespace-nowrap transition-colors sm:flex-initial",
                  filter === option ? "bg-background font-semibold text-page-accent-strong shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`filter.${option}`)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {finished ? <ScoringLegend /> : null}

      <div className="relative w-full sm:w-72 sm:self-end">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" />
      </div>

      <div className="overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-xs">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold whitespace-nowrap text-muted-foreground">
              {showRank ? <th className="w-10 px-2 py-2.5 text-center sm:px-3">{tLb("columns.rank")}</th> : null}
              <th className="px-2 py-2.5 text-left sm:px-3">{t("col.member")}</th>
              <th className="w-20 px-2 py-2.5 text-center sm:w-24 sm:px-3">{t("col.prediction")}</th>
              <th className="w-14 px-2 py-2.5 text-center sm:w-16 sm:px-3 sm:text-right">{t("col.points")}</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-10 text-center text-sm text-muted-foreground">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              visible.map((row) => {
                const isMe = row.member.user_id === currentUserId;
                return (
                  <tr
                    key={row.member.user_id}
                    className={cn("border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted", isMe && "bg-page-accent-soft/40")}
                  >
                    {showRank ? (
                      <td className="px-2 py-2.5 text-center font-mono text-xs font-medium text-muted-foreground tabular-nums sm:px-3">
                        {rankByUser.get(row.member.user_id)}
                      </td>
                    ) : null}
                    <td className="px-2 py-2.5 sm:px-3">
                      <div className="flex min-w-0 flex-col leading-tight">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate font-medium">{name(row)}</span>
                          {isMe ? (
                            <span className="shrink-0 rounded-md bg-page-accent p-1 text-2xs font-medium tracking-wide text-white uppercase">{tLb("you")}</span>
                          ) : null}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">@{row.member.username}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center whitespace-nowrap sm:px-3">
                      {row.pick ? <PredictionScore pick={row.pick} /> : <span className="text-sm text-muted-foreground">&mdash;</span>}
                    </td>
                    <td className="px-2 py-2.5 sm:px-3">
                      <div className="flex justify-center sm:justify-end">
                        <PickCategoryBadge category={row.category} points={row.points} compact />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
