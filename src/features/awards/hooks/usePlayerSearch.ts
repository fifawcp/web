"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/shared/hooks/useDebounce";

import { fetchPlayers, PLAYERS_QUERY_KEY } from "../api/awards";
import { playerSearchDebounceMs } from "../lib/awards";
import type { PlayerPosition } from "../types/awards.types";

type Params = {
  q: string;
  positions: PlayerPosition[];
  /** Picker open — gates the request so closed pickers don't fetch. */
  enabled: boolean;
};

/**
 * Debounced player search. The text query is debounced on a tiered delay
 * (see `playerSearchDebounceMs`); position filters apply immediately. The
 * request only fires once there's something to narrow on — a text query or a
 * position filter — so we never dump the full 1600-row catalog on open.
 *
 * `placeholderData: keepPreviousData` keeps the previous results on screen
 * while the next debounced query resolves, so the list doesn't flash empty on
 * every keystroke.
 */
export function usePlayerSearch({ q, positions, enabled }: Params) {
  const debouncedQ = useDebounce(q, playerSearchDebounceMs(q));
  const trimmed = debouncedQ.trim();

  const hasCriteria = trimmed.length > 0 || positions.length > 0;

  const query = useQuery({
    queryKey: [...PLAYERS_QUERY_KEY, { q: trimmed, positions }],
    queryFn: () => fetchPlayers({ q: trimmed, positions }),
    enabled: enabled && hasCriteria,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  return {
    ...query,
    /** True before any criteria are entered — drives the "start typing" prompt. */
    isIdle: enabled && !hasCriteria,
    /** True while the debounce is pending (user typed but request not yet sent). */
    isDebouncing: q.trim() !== trimmed,
  };
}
