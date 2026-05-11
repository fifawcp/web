"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { filtersToParams, paramsToFilters } from "../lib/urlFilters";
import type { ScheduleFilters, Team } from "../types/schedule.types";

// URL-backed filter state. Returns a [filters, setFilters] tuple shaped like
// useState so call sites read naturally. The setter reconciles the team filter
// against the new group so the URL never holds an empty-result combination
export function useScheduleFilters(allTeams: Team[]): [ScheduleFilters, (next: ScheduleFilters) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (next: ScheduleFilters) => {
      const reconciled: ScheduleFilters = isTeamValidForGroup(next, allTeams) ? next : { ...next, team: "all" };

      const qs = filtersToParams(reconciled).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, allTeams]
  );

  return [filters, setFilters];
}

function isTeamValidForGroup(filters: ScheduleFilters, allTeams: Team[]): boolean {
  if (filters.team === "all" || filters.group === "all") return true;
  const team = allTeams.find((t) => t.fifa_code === filters.team);
  return team?.group_code === filters.group;
}
