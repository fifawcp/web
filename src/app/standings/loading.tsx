import { Skeleton } from "@/shared/components/ui/skeleton";

/** Skeleton that mirrors the real Standings layout 1:1 to avoid hydration shift. */
export default function StandingsLoading() {
  return (
    <div className="container mx-auto flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-3 w-32" />
          {/* Mirrors CompareToggle: two segments inside a pill-shaped track. */}
          <CompareToggleSkeleton />
        </div>
        <Skeleton className="h-9 w-48 sm:h-10" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </header>
      <LegendSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <GroupCardSkeleton key={i} />
        ))}
      </div>
      <ThirdPlaceSkeleton />
    </div>
  );
}

/** Same outer shape as <CompareToggle>: two segments in a rounded muted track. */
function CompareToggleSkeleton() {
  return (
    <div className="flex rounded-md bg-muted p-0.5">
      <Skeleton className="h-7 w-20 rounded bg-background/60" />
      <Skeleton className="ml-0.5 h-7 w-20 rounded bg-transparent" />
    </div>
  );
}

/**
 * Mirrors <ComparisonLegend>: card with a section header, the YOU column pills,
 * and the scoring formula row beneath a divider. Rendered up front so the page
 * doesn't reflow when compare mode opens after pickem data resolves.
 */
function LegendSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <Skeleton className="h-3 w-40" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-56" />
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <Skeleton className="h-3 w-32" />
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-5" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Mirrors the cross-group third-place table below the group grid. */
function ThirdPlaceSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-56 sm:h-8" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-2">
          <Skeleton className="h-3 w-full" />
        </div>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-t border-border px-4 py-3">
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="size-4 shrink-0" />
            <Skeleton className="h-4 w-32 shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
        <div className="border-t border-border px-4 py-3">
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </div>
  );
}

function GroupCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-5" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="border-b border-border px-4 py-2">
        <Skeleton className="h-3 w-full" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-border px-4 py-3">
          <Skeleton className="size-4 shrink-0" />
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
      <div className="border-t border-border px-4 py-3">
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}
