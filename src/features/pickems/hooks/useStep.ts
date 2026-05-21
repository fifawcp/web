"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { parseStep } from "../lib/pickemStep";
import type { PickemStep } from "../types/pickems.types";

export function useStep(): [PickemStep, (next: PickemStep) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = parseStep(params.get("step"));

  const setStep = useCallback(
    (next: PickemStep) => {
      const qs = new URLSearchParams(params.toString());

      if (next === "groups") qs.delete("step");
      else qs.set("step", next);

      const search = qs.toString();
      router.replace(`${pathname}${search ? `?${search}` : ""}`, { scroll: false });
    },
    [params, pathname, router]
  );

  return [current, setStep];
}
