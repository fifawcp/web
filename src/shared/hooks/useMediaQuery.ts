"use client";

import { useSyncExternalStore } from "react";

const subscribe = (query: string) => (notify: () => void) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
};

export function useMediaQuery(query: string, serverDefault = false): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => serverDefault
  );
}

export const useIsMobile = () => !useMediaQuery("(min-width: 768px)", true);
