import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { HeroSkeleton } from "./HeroSkeleton";

// Mirrors the new PickStatusSection — outer card with header + stacked sub-cards.
function PickStatusSkeleton() {
  return (
    <Card size="sm" className="flex h-full flex-col gap-4 p-4 sm:p-5 animate-pulse">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="mt-4 flex flex-col gap-3 px-[3px]">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
            <Skeleton className="size-12 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-1.5 w-full" />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Mirrors the new LeaderboardSection — header + tabs + 5 rows + footer link.
function LeaderboardSkeleton() {
  return (
    <Card size="sm" className="flex h-full flex-col p-4 sm:p-5 animate-pulse">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="mt-4 h-9 w-full rounded-md" />
      <div className="mt-3 flex items-center justify-between border-b border-border px-2 pb-2">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-2.5 w-12" />
      </div>
      <ul className="divide-y divide-border">
        {[...Array(5)].map((_, j) => (
          <li key={j} className="flex items-center gap-3 px-2 py-2.5">
            <Skeleton className="size-4" />
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-3 w-10" />
          </li>
        ))}
      </ul>
      <div className="mt-auto flex justify-end pt-3">
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  );
}

export function DashboardLoading() {
  return (
    <div className="relative flex flex-col">
      {/* Hero skeleton — matches HeroSection padding */}
      <section className="relative overflow-hidden bg-muted/30 dark:bg-zinc-950">
        <div className="container py-6 lg:py-8">
          <HeroSkeleton />
        </div>
      </section>

      {/* PickStatus + Leaderboard skeletons */}
      <section className="border-t border-border">
        <div className="container py-6 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <PickStatusSkeleton />
            </div>
            <div className="flex-1">
              <LeaderboardSkeleton />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
