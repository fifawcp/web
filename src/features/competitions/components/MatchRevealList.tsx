"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { Match } from "@/features/schedule/types/schedule.types";
import { Link } from "@/i18n/navigation";
import { Input } from "@/shared/components/ui/input";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";

import { MatchRevealPreview } from "./breakdown/MatchRevealPreview";
import { StackedMatchTeams } from "./breakdown/StackedMatchTeams";

type Props = {
  boardId: number;
  competitionId: number;
  matches: Match[];
};

// "How the board predicted" — the competition's revealable matches (newest first).
// Mobile: a searchable list where each row links to the full match breakdown.
// Desktop: master-detail — hovering/focusing a row previews that match's distribution
// on the right, filling the wide space; clicking still opens the full breakdown.
export function MatchRevealList({ boardId, competitionId, matches }: Props) {
  const t = useTranslations("competitions.breakdown.boardPredictions");
  const locale = useLocale();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState<number | null>(matches[0]?.id ?? null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter((match) => {
      const haystack = [
        match.teams.home ? getTeamName(match.teams.home, locale) : "",
        match.teams.away ? getTeamName(match.teams.away, locale) : "",
        match.teams.home?.fifa_code ?? "",
        match.teams.away?.fifa_code ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [matches, query, locale]);

  // The previewed match, kept valid against the filtered list (falls back to the first).
  const previewMatch = useMemo(() => visible.find((m) => m.id === previewId) ?? visible[0] ?? null, [visible, previewId]);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-foreground/10 bg-card p-4 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-heading text-base font-semibold">{t("title")}</h2>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("noResults")}</p>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          <ul className="-mx-1 flex max-h-40 flex-col gap-1.5 overflow-y-auto px-1 lg:h-44 lg:max-h-none lg:w-1/2 lg:shrink-0">
            {visible.map((match) => (
              <li key={match.id}>
                <RevealRow
                  boardId={boardId}
                  competitionId={competitionId}
                  match={match}
                  locale={locale}
                  active={match.id === previewMatch?.id}
                  onPreview={() => setPreviewId(match.id)}
                />
              </li>
            ))}
          </ul>

          {previewMatch ? (
            <div className="hidden lg:block lg:h-44 lg:min-w-0 lg:flex-1">
              <MatchRevealPreview boardId={boardId} competitionId={competitionId} match={previewMatch} enabled={isDesktop} />
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function RevealRow({
  boardId,
  competitionId,
  match,
  locale,
  active,
  onPreview,
}: {
  boardId: number;
  competitionId: number;
  match: Match;
  locale: string;
  active: boolean;
  onPreview: () => void;
}) {
  const t = useTranslations("competitions.breakdown");
  const result = match.result;

  const score = result ? (
    <span className="font-heading text-base font-bold tabular-nums">
      {result.home_score}
      <span className="px-1 font-normal text-muted-foreground">&minus;</span>
      {result.away_score}
    </span>
  ) : (
    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("vs")}</span>
  );

  return (
    <Link
      href={`/boards/${boardId}/competitions/${competitionId}/matches/${match.id}`}
      onMouseEnter={onPreview}
      onFocus={onPreview}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg bg-muted/50 px-3 py-1.5 transition-colors hover:bg-muted",
        active && "lg:bg-muted lg:ring-1 lg:ring-border lg:ring-inset"
      )}
    >
      <StackedMatchTeams match={match} score={score} locale={locale} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}
