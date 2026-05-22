import { Skeleton } from "@/shared/components/ui/skeleton";

/** Skeleton that mirrors the real Standings layout 1:1 to avoid hydration shift. */
export default function StandingsLoading() {
  return (
    <div className="container mx-auto flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-48 sm:h-10" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </header>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <GroupCardSkeleton key={i} />
        ))}
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
