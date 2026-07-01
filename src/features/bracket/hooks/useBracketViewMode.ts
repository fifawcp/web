"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { BracketViewMode } from "../types/bracket.types";

/**
 * URL-backed bracket view-mode state. Returns a `[mode, setMode]` tuple shaped
 * like `useState`. Three modes share the `?view=` param: `results` (default, no
 * param), `compare`, and `simulate`.
 *
 * `compare` requires `canCompare` (authenticated **and** the tournament has
 * started — nothing to compare against before kickoff). When it's disabled, any
 * `?view=compare` deep-link is forced back to `results` and the param stripped.
 * `simulate` is always available (guests included).
 */
export function useBracketViewMode(canCompare: boolean): [BracketViewMode, (next: BracketViewMode) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const raw = params.get("view");
  const rawMode: BracketViewMode = raw === "compare" ? "compare" : raw === "simulate" ? "simulate" : "results";
  const mode: BracketViewMode = rawMode === "compare" && !canCompare ? "results" : rawMode;

  // Strip ?view=compare for visitors who can't compare (guest / pre-tournament).
  useEffect(() => {
    if (rawMode === "compare" && !canCompare) {
      const query = new URLSearchParams(params);
      query.delete("view");
      const qs = query.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [canCompare, rawMode, router, pathname, params]);

  const setMode = useCallback(
    (next: BracketViewMode) => {
      const query = new URLSearchParams(params);
      if (next === "results") query.delete("view");
      else query.set("view", next);
      const qs = query.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, params]
  );

  return [mode, setMode];
}
