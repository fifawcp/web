"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { PickemsSkeleton } from "@/features/pickems/components/PickemsSkeleton";
import { parseStep } from "@/features/pickems/lib/pickemStep";

const CONTAINER = "container flex flex-col gap-6 pt-6 pb-28 lg:pt-8 lg:pb-8";

/**
 * Client component so we can read `?step=` via `useSearchParams` — server
 * loading files don't receive the searchParams prop, which is why the
 * skeleton previously always rendered step 1 even when the user landed on
 * `?step=thirds` or `?step=bracket`. The inner Suspense is Next.js's
 * requirement when calling `useSearchParams` from a route segment; in
 * practice it never suspends since the URL is available eagerly.
 */
export default function PickemsLoading() {
  return (
    <div className={CONTAINER}>
      <Suspense fallback={<PickemsSkeleton />}>
        <StepAwareSkeleton />
      </Suspense>
    </div>
  );
}

function StepAwareSkeleton() {
  const params = useSearchParams();
  const step = parseStep(params.get("step"));
  return <PickemsSkeleton step={step} />;
}
