"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { StandingsViewMode } from "../types/standings.types";

/**
 * URL-backed compare-view state. Returns a `[view, setView]` tuple shaped like
 * `useState` so call sites read naturally — mirrors `useScheduleFilters`.
 *
 * Anyone (including users without a complete pickem) can flip into compare
 * mode. When their pickem is missing or partial the table renders every row
 * with the "not picked" pill — see `buildPickIndex`.
 */
export function useCompareView(): [StandingsViewMode, (next: StandingsViewMode) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const view: StandingsViewMode = params.get("view") === "compare" ? "compare" : "normal";

  const setView = useCallback(
    (next: StandingsViewMode) => {
      const query = new URLSearchParams(params);
      if (next === "normal") query.delete("view");
      else query.set("view", next);
      const qs = query.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, params]
  );

  return [view, setView];
}
