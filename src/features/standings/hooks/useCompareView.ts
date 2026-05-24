"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { StandingsViewMode } from "../types/standings.types";

/**
 * URL-backed compare-view state. Returns a `[view, setView]` tuple shaped like
 * `useState` so call sites read naturally — mirrors `useScheduleFilters`.
 *
 * Compare mode requires authentication. Guests who navigate to `?view=compare`
 * are redirected to plain standings. Authenticated users without a complete pickem still
 * see compare mode — every row renders with the "not picked" pill.
 */
export function useCompareView(isAuthed: boolean): [StandingsViewMode, (next: StandingsViewMode) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const rawView = params.get("view") === "compare" ? "compare" : "normal";
  // Guests cannot access compare mode — force normal view while redirect fires.
  const view: StandingsViewMode = isAuthed ? rawView : "normal";

  // Redirect guests who land on ?view=compare to plain standings.
  useEffect(() => {
    if (!isAuthed && rawView === "compare") {
      router.replace(pathname);
    }
  }, [isAuthed, rawView, router, pathname]);

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
