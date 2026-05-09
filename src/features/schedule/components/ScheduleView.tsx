"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useMatches } from "../hooks/useMatches";
import { useScheduleFilters } from "../hooks/useScheduleFilters";
import { collectTeams } from "../lib/collectTeams";
import { computePickStats } from "../lib/computePickStats";
import { filterMatches } from "../lib/filterMatches";
import { groupMatchesByLocalDate } from "../lib/groupByDate";
import { scrollMatchIntoView } from "../lib/scrollMatchIntoView";
import { DEFAULT_FILTERS, type Match, type PickFilter } from "../types/schedule.types";

import { MatchDateGroup } from "./MatchDateGroup";
import { PendingPicksCta } from "./PendingPicksCta";
import { PickProgressCard } from "./PickProgressCard";
import { PickProgressDashboard } from "./PickProgressDashboard";
import { PickStatusTabs } from "./PickStatusTabs";
import { ScheduleFilters } from "./ScheduleFilters";
import { SignedOutCta } from "./SignedOutCta";

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

  const filteredByChips = useMemo(() => filterMatches(matches, { ...filters, pick: "all" }), [matches, filters]);
  const filtered = useMemo(
    () => (filters.pick === "all" ? filteredByChips : filterMatches(filteredByChips, { ...DEFAULT_FILTERS, pick: filters.pick })),
    [filteredByChips, filters.pick]
  );
  const groups = useMemo(() => groupMatchesByLocalDate(filtered), [filtered]);

  const overallStats = useMemo(() => computePickStats(matches), [matches]);
  const tabStats = useMemo(() => computePickStats(filteredByChips), [filteredByChips]);
  const counts = { all: filteredByChips.length, pending: tabStats.pendingAll, picked: tabStats.picked };

  const onPickChange = (next: PickFilter) => setFilters({ ...filters, pick: next });

  return (
    <div className="flex flex-col">
      <div className="container mx-auto flex w-full flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        {isAuthed ? (
          <>
            <div className="lg:hidden">
              <PickProgressCard stats={overallStats} />
            </div>
            <div className="hidden lg:block">
              <PickProgressDashboard stats={overallStats} />
            </div>
          </>
        ) : (
          <SignedOutCta />
        )}
        {isAuthed && overallStats.pendingAll > 0 && anchorMatchId !== null && (
          <PendingPicksCta count={overallStats.pendingAll} onPress={() => scrollMatchIntoView(anchorMatchId)} />
        )}
      </div>

      <ScheduleFilters
        filters={filters}
        onChange={setFilters}
        teams={visibleTeams}
        tabs={isAuthed ? <PickStatusTabs value={filters.pick} onChange={onPickChange} counts={counts} /> : undefined}
      />

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
