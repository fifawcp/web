"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useMatches } from "../hooks/useMatches";
import { useScheduleFilters } from "../hooks/useScheduleFilters";
import { useScrollToAnchor } from "../hooks/useScrollToAnchor";
import { collectTeams } from "../lib/collectTeams";
import { filterMatches } from "../lib/filterMatches";
import { groupMatchesByLocalDate } from "../lib/groupByDate";
import { type Match } from "../types/schedule.types";

import { MatchDateGroup } from "./MatchDateGroup";
import { ScheduleFilters } from "./ScheduleFilters";

type Props = {
  initialMatches: Match[];
  anchorMatchId: number | null;
  isAuthed: boolean;
};

export function ScheduleView({ initialMatches, anchorMatchId, isAuthed }: Props) {
  const t = useTranslations("schedule");
  const { data: matches = [] } = useMatches(initialMatches);

  const allTeams = useMemo(() => collectTeams(matches), [matches]);
  const [filters, setFilters] = useScheduleFilters(allTeams);

  // Filter the teams by group if the group is not "all"
  const visibleTeams = useMemo(() => (filters.group === "all" ? allTeams : allTeams.filter((team) => team.group_code === filters.group)), [allTeams, filters.group]);

  const filtered = useMemo(() => filterMatches(matches, filters), [matches, filters]);
  const groups = useMemo(() => groupMatchesByLocalDate(filtered), [filtered]);

  useScrollToAnchor(anchorMatchId, matches.length);

  return (
    <div className="flex flex-col">
      <ScheduleFilters filters={filters} onChange={setFilters} teams={visibleTeams} />
      <div className="container mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {groups.length === 0 ? (
          <EmptyState title={t("empty.title")} description={t("empty.description")} />
        ) : (
          groups.map((g) => <MatchDateGroup key={g.key} group={g} isAuthed={isAuthed} />)
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg px-6 py-16 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
