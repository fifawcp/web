import { Skeleton } from "@/shared/components/ui/skeleton";

import { AWARD_TYPES } from "../lib/awards";

/** Mirrors `AwardsView`'s layout 1:1 (header + top action bar + 4-col grid). */
export function AwardsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>

      {/* Action bar */}
      <Skeleton className="h-14 w-full rounded-xl" />

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {AWARD_TYPES.map((type) => (
          <div key={type} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-start gap-2.5">
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32 max-w-full" />
              </div>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-3">
              <Skeleton className="size-[72px] rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
