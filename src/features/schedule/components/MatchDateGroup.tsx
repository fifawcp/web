"use client";

import { useLocale, useTranslations } from "next-intl";

import { formatDateHeader } from "../lib/formatDateHeader";
import type { MatchDateGroup as DateGroup } from "../lib/groupByDate";

import { MatchCard } from "./MatchCard";

type Props = {
  group: DateGroup;
  isAuthed: boolean;
};

export function MatchDateGroup({ group, isAuthed }: Props) {
  const locale = useLocale();
  const t = useTranslations("schedule");
  const dateLabel = formatDateHeader(group.date, locale);

  return (
    // --schedule-scroll-offset (defined in globals.css) clears the sticky stack
    // so the date header lands just below the filter bar on anchor match scroll
    <section className="flex scroll-mt-(--schedule-scroll-offset) flex-col gap-3">
      <header className="flex items-center justify-between px-1 py-1">
        <h2 className="text-sm font-semibold text-foreground">{dateLabel}</h2>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{t("matchCount", { count: group.matches.length })}</span>
      </header>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {group.matches.map((m) => (
          <MatchCard key={m.id} match={m} isAuthed={isAuthed} />
        ))}
      </div>
    </section>
  );
}
