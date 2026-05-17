import { HeroSkeleton } from "@/features/dashboard/components/HeroSkeleton";

export function DashboardLoading() {
  return (
    <div className="relative flex flex-col">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden bg-muted/30 dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <HeroSkeleton />
        </div>
      </section>

      {/* PickStatus + Leaderboard skeletons */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <CardSkeleton />
            </div>
            <div className="flex-1">
              <LeaderboardSkeleton />
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  function CardSkeleton() {
    return (
      <div className="bg-card rounded-xl border border-border animate-pulse h-full">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4 border-b border-border last:border-b-0">
            <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
              <div className="h-1.5 w-full bg-muted rounded-full" />
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-8 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function LeaderboardSkeleton() {
    return (
      <div className="bg-card rounded-xl border border-border animate-pulse h-full">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col flex-1">
              <div className="flex items-center px-4 py-3 border-b border-border">
                <div className="h-4 w-28 bg-muted rounded" />
              </div>
              <div className="flex flex-col">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-center gap-2 px-4 py-2.5 border-b border-border last:border-b-0">
                    <div className="h-4 w-4 bg-muted rounded" />
                    <div className="h-7 w-7 rounded-full bg-muted" />
                    <div className="flex-1 h-4 bg-muted rounded" />
                    <div className="h-4 w-10 bg-muted rounded" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end px-4 py-3 border-t border-border">
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
