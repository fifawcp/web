"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { BracketViewMode } from "../types/bracket.types";

/**
 * URL-backed compare-view state. Returns a `[view, setView]` tuple shaped like
 * `useState` — mirrors `useCompareView` on Standings.
 *
 * Compare requires `enabled` (authenticated **and** the tournament has started —
 * there is nothing to compare against before kickoff). When disabled, any
 * `?view=compare` in the URL is forced back to the predicted view and the param
 * is stripped, so guests and pre-tournament visitors can't deep-link into it.
 */
export function useBracketCompareView(enabled: boolean): [BracketViewMode, (next: BracketViewMode) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const rawView = params.get("view") === "compare" ? "compare" : "results";
  const view: BracketViewMode = enabled ? rawView : "results";

  // Strip ?view=compare for visitors who can't compare (guest / pre-tournament).
  useEffect(() => {
    if (!enabled && rawView === "compare") {
      const query = new URLSearchParams(params);
      query.delete("view");
      const qs = query.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [enabled, rawView, router, pathname, params]);

  const setView = useCallback(
    (next: BracketViewMode) => {
      const query = new URLSearchParams(params);
      if (next === "results") query.delete("view");
      else query.set("view", next);
      const qs = query.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, params]
  );

  return [view, setView];
}
