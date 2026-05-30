"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { fetchStandings, STANDINGS_QUERY_KEY } from "@/features/standings/api/standings";
import { getTeamName } from "@/shared/lib/getTeamName";
import type { Team } from "@/shared/types/wcp.types";

/**
 * The tournament's teams, for the country filter. Sourced from the public
 * standings (the only full 48-team list available client-side), deduped and
 * sorted by localized name. Gated on `enabled` so it loads only with the filters.
 */
export function useFilterTeams(enabled: boolean): { teams: Team[]; isLoading: boolean } {
  const locale = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: STANDINGS_QUERY_KEY,
    queryFn: fetchStandings,
    enabled,
    staleTime: 600_000,
  });

  const teams = useMemo(() => {
    const byCode = new Map<string, Team>();
    for (const row of data ?? []) byCode.set(row.team.fifa_code, row.team);
    return [...byCode.values()].sort((a, b) => getTeamName(a, locale).localeCompare(getTeamName(b, locale)));
  }, [data, locale]);

  return { teams, isLoading };
}
