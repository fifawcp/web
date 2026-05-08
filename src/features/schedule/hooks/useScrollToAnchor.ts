"use client";

import { useLayoutEffect } from "react";

// Scroll the date group containing the anchor match into view on initial mount
export function useScrollToAnchor(matchId: number | null, listLength: number) {
  useLayoutEffect(() => {
    if (matchId == null || listLength === 0) return;

    const card = document.querySelector(`[data-match-id="${matchId}"]`);
    const section = card?.closest("section");
    section?.scrollIntoView({ behavior: "auto", block: "start" });
    // Intentionally only on initial mount, we don't want to yank the user
    // back to "now" when they change filters

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
