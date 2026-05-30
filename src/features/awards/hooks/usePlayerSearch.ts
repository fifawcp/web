"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/shared/hooks/useDebounce";

import { fetchPlayers, PLAYERS_QUERY_KEY } from "../api/awards";
import { PLAYER_SEARCH_DEBOUNCE_MS } from "../lib/awards";
import type { PlayerPosition } from "../types/awards.types";

type Params = {
  q: string;
  positions: PlayerPosition[];
  /** Selected country FIFA codes (AND with positions / query server-side). */
  teamFifaCodes: string[];
  /** Picker open — gates the request so closed pickers don't fetch. */
  enabled: boolean;
};

/**
 * Debounced player search. The text query is debounced; filters apply
 * immediately. The request only fires once there's something to narrow on, and
 * `keepPreviousData` holds the prior results on screen while the next query
 * resolves so the list never flashes empty between keystrokes.
 */
export function usePlayerSearch({ q, positions, teamFifaCodes, enabled }: Params) {
  const debouncedQ = useDebounce(q, PLAYER_SEARCH_DEBOUNCE_MS);
  const trimmed = debouncedQ.trim();

  const hasCriteria = trimmed.length > 0 || positions.length > 0 || teamFifaCodes.length > 0;

  const query = useQuery({
    queryKey: [...PLAYERS_QUERY_KEY, { q: trimmed, positions, teamFifaCodes }],
    queryFn: ({ signal }) => fetchPlayers({ q: trimmed, positions, team_fifa_codes: teamFifaCodes }, signal),
    enabled: enabled && hasCriteria,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  return {
    ...query,
    /** True when the picker is open but no criteria are entered yet. */
    hasCriteria,
    /** True while the debounce is pending (user typed but request not yet sent). */
    isDebouncing: q.trim() !== trimmed,
  };
}
