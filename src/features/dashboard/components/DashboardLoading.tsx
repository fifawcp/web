import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

// ─── shared card skeletons (authed dashboard) ────────────────────────────────

// Mirrors FeaturedMatchCard — kicker row, outer-aligned teams, meta row, footer.
function FeaturedMatchSkeleton() {
  return (
    <Card size="sm" className="gap-5 border border-border p-4 animate-pulse sm:p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
        <div className="flex flex-col items-start gap-2.5">
          <Skeleton className="h-9 w-13 rounded-xs sm:h-10 sm:w-14" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="h-5 w-8" />
        <div className="flex flex-col items-end gap-2.5">
          <Skeleton className="h-9 w-13 rounded-xs sm:h-10 sm:w-14" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-lg" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-md sm:w-40" />
      </div>
    </Card>
  );
}

// Mirrors StatsStrip — 3 divided tiles.
function StatsStripSkeleton() {
  return (
    <Card size="sm" className="grid grid-cols-3 divide-x divide-border p-0 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5 px-3 py-3 sm:px-4">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </Card>
  );
}

// Mirrors SlimBanner — icon + text + trailing link.
function SlimBannerSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-2.5 animate-pulse">
      <Skeleton className="size-7 rounded-lg" />
      <Skeleton className="h-3.5 flex-1" />
      <Skeleton className="h-3.5 w-24" />
    </div>
  );
}

// Mirrors ProgressCardsSection — section head + 3 ring cards.
function ProgressCardsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} size="sm" className="gap-3 p-4 animate-pulse">
            <div className="flex items-start justify-between">
              <Skeleton className="size-13 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="size-7 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Mirrors GroupStandingsCard — section heading + card (header + rows + legend).
function GroupStandingsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-36 animate-pulse" />
        <Skeleton className="h-3 w-52 animate-pulse" />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs animate-pulse">
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex flex-col gap-3 px-4 pb-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-3" />
              <Skeleton className="h-4 w-6 rounded-xs" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="ml-auto h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="border-t border-border px-4 py-3">
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}

// Mirrors QuickActionsCard — title + 3 rows.
function QuickActionsSkeleton() {
  return (
    <Card size="sm" className="gap-3 p-4 animate-pulse sm:p-5">
      <Skeleton className="h-4 w-28" />
      <div className="flex flex-col gap-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Mirrors TitleFavoritesCard — title + 3 bar rows.
function TitleFavoritesSkeleton() {
  return (
    <Card size="sm" className="gap-4 p-4 animate-pulse sm:p-5">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-5 w-7 rounded-xs" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 flex-1 rounded-full" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// Mirrors LeaderboardCard — header + tabs + rows + footer link (fills the rail).
function LeaderboardSkeleton() {
  return (
    <Card size="sm" className="flex h-full flex-1 flex-col p-4 animate-pulse sm:p-5">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="mt-4 h-9 w-full rounded-md" />
      <div className="mt-3 flex items-center justify-between border-b border-border px-2 pb-2">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-2.5 w-12" />
      </div>
      <ul className="flex flex-1 flex-col divide-y divide-border">
        {[...Array(8)].map((_, j) => (
          <li key={j} className="flex flex-1 items-center gap-3 px-2 py-2.5">
            <Skeleton className="size-4" />
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

// Authed dashboard skeleton — mirrors DashboardView 1:1.
export function DashboardLoading() {
  return (
    <div className="relative flex flex-col">
      <section className="container py-6 lg:py-8">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.72fr)_minmax(300px,1fr)] lg:items-stretch">
          <div className="flex min-w-0 flex-col gap-4">
            <FeaturedMatchSkeleton />
            <StatsStripSkeleton />
            <SlimBannerSkeleton />
            <ProgressCardsSkeleton />
            <GroupStandingsSkeleton />
          </div>
          <aside className="flex min-w-0 flex-col gap-4">
            <QuickActionsSkeleton />
            <TitleFavoritesSkeleton />
            <LeaderboardSkeleton />
          </aside>
        </div>
      </section>
    </div>
  );
}

// ─── guest landing skeleton — mirrors GuestLanding ───────────────────────────

export function LandingLoading() {
  return (
    <div className="container flex flex-col gap-10 py-6 animate-pulse lg:gap-12 lg:py-8">
      {/* Hero band */}
      <Skeleton className="h-72 w-full rounded-2xl lg:h-64" />

      {/* See how scoring works — two columns */}
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Card size="sm" className="gap-5 p-4 sm:p-6">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-md" />
        </Card>
      </div>

      {/* Three ways to play */}
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} size="sm" className="gap-3 p-4 sm:p-5">
              <Skeleton className="size-9 rounded-lg" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-24 border-t border-border pt-3" />
            </Card>
          ))}
        </div>
      </div>

      {/* By the numbers + social proof */}
      <div className="grid items-stretch gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i} size="sm" className="gap-2 p-3.5">
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-16" />
              </Card>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-56" />
          <TitleFavoritesSkeleton />
        </div>
      </div>

      {/* Final CTA */}
      <Skeleton className="h-44 w-full rounded-2xl" />
    </div>
  );
}
