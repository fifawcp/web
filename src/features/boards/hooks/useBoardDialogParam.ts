"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type BoardDialog = "create" | "join";

/**
 * Reads `?dialog=create|join` once on mount (footer links land here to open a
 * dialog), then strips the param so a refresh or back-navigation doesn't reopen
 * it. Returns the captured value for seeding dialog open-state.
 */
export function useBoardDialogParam(): BoardDialog | null {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const param = searchParams.get("dialog");
  const [initial] = useState<BoardDialog | null>(() => (param === "create" || param === "join" ? param : null));

  useEffect(() => {
    if (!param) return;
    const next = new URLSearchParams(searchParams);
    next.delete("dialog");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [param, pathname, router, searchParams]);

  return initial;
}
