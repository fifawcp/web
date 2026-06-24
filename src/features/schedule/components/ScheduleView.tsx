"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";

import { useMatches } from "../hooks/useMatches";
import { useScheduleFilters } from "../hooks/useScheduleFilters";
import { collectTeams } from "../lib/collectTeams";
import { computePickStats } from "../lib/computePickStats";
import { filterMatches } from "../lib/filterMatches";
import { findTodayMatchId } from "../lib/findTodayMatchId";
import { groupMatchesByLocalDate } from "../lib/groupByDate";
import { scrollMatchIntoView } from "../lib/scrollMatchIntoView";
import { DEFAULT_FILTERS, type Match, type PickFilter } from "../types/schedule.types";

import { MatchDateGroup } from "./MatchDateGroup";
import { PendingPicksCta } from "./PendingPicksCta";
import { PickProgressPanel } from "./PickProgressPanel";
import { PickStatusTabs } from "./PickStatusTabs";
import { ScheduleFilters } from "./ScheduleFilters";
import { ScoringInfoDialog } from "./ScoringInfoDialog";
import { SignedOutCta } from "./SignedOutCta";
import { UpToDateCta } from "./UpToDateCta";

type Props = {
  initialMatches: Match[];
  anchorMatchId: number | null;
  isAuthed: boolean;
  deepLinkMatchId?: number | null;
  // Deep link asked to open the picker (`&edit=1`) — opened on the target card if pickable.
  deepLinkEdit?: boolean;
};

export function ScheduleView({ initialMatches, anchorMatchId, isAuthed, deepLinkMatchId = null, deepLinkEdit = false }: Props) {
  const t = useTranslations("schedule");
  const { data: matches = [] } = useMatches(initialMatches);

  const autoEditMatchId = deepLinkEdit ? deepLinkMatchId : null;

  // Arriving via a competition's "make picks" deep link (?match=<id>) — scroll to that match once.
  // Poll briefly so the scroll waits until the target card has actually rendered.
  const scrolledTo = useRef<number | null>(null);
  useEffect(() => {
    if (deepLinkMatchId == null || scrolledTo.current === deepLinkMatchId) return;
    let frame = 0;
    let attempts = 0;
    const tryScroll = () => {
      if (document.querySelector(`[data-match-id="${deepLinkMatchId}"]`)) {
        scrolledTo.current = deepLinkMatchId;
        scrollMatchIntoView(deepLinkMatchId);
        return;
      }
      if (attempts++ < 30) frame = requestAnimationFrame(tryScroll);
    };
    frame = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frame);
  }, [deepLinkMatchId]);

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

  // First match of the user's local "today" — null on rest days, which hides the button.
  const todayMatchId = useMemo(() => findTodayMatchId(matches), [matches]);

  const onPickChange = (next: PickFilter) => setFilters({ ...filters, pick: next });

  const showPendingCta = isAuthed && overallStats.pendingAll > 0 && anchorMatchId !== null;
  const showUpToDateCta = isAuthed && overallStats.pendingAll === 0;

  return (
    <div className="flex flex-col">
      <div className="container flex flex-col gap-3 pt-6 pb-4 lg:pt-8">
        {isAuthed ? <PickProgressPanel stats={overallStats} /> : <SignedOutCta />}
        {showPendingCta && <PendingPicksCta count={overallStats.pendingAll} onPress={() => scrollMatchIntoView(anchorMatchId!)} />}
        {showUpToDateCta && <UpToDateCta nextMatchAt={overallStats.nextMatchAt} />}
      </div>

      <ScheduleFilters
        filters={filters}
        onChange={setFilters}
        teams={visibleTeams}
        tabs={isAuthed ? <PickStatusTabs value={filters.pick} onChange={onPickChange} counts={counts} /> : undefined}
        onGoToToday={todayMatchId != null ? () => scrollMatchIntoView(todayMatchId) : undefined}
      />

      <div className="container flex flex-col gap-6 py-6">
        {groups.length === 0 ? (
          <EmptyState title={t("empty.title")} description={t("empty.description")} />
        ) : (
          groups.map((g) => <MatchDateGroup key={g.key} group={g} isAuthed={isAuthed} autoEditMatchId={autoEditMatchId} />)
        )}
      </div>

      {isAuthed && <ScoringInfoDialog />}
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
