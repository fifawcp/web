import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Skeleton mirrors the authenticated /profile layout 1:1 (§2.1). The route
 * is middleware-gated so there's no guest variant. Sessions data is loaded
 * lazily inside the Devices tab — its inline skeleton lives in
 * `SessionsContent`.
 */
export default function ProfileLoading() {
  return (
    <div className="container mx-auto flex w-full flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-56 sm:h-10" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </header>

      <IdentityHeroSkeleton />
      <PickemPeekSkeleton />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BoardsPeekSkeleton />
        <CalendarPeekSkeleton />
      </div>

      <ManagementTabsSkeleton />
    </div>
  );
}

/** Mirrors `IdentityHero`: large avatar + name + meta lines + joined date + edit button. */
function IdentityHeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex flex-col items-center gap-5 sm:flex-1 sm:flex-row sm:items-center sm:gap-6">
          <Skeleton className="size-20 shrink-0 rounded-full sm:size-24" />
          <div className="flex w-full min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-7 w-48 sm:h-8 sm:w-64" />
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-48" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 self-center sm:self-start" />
      </div>
    </div>
  );
}

/** Mirrors `PickemPeek`: header + 3 stat tiles + champion plate. */
function PickemPeekSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-32 self-start sm:self-auto" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-1 w-full" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors `BoardsPeek`: title + 2 rows + footer link. */
function BoardsPeekSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full self-start sm:self-auto" />
      </div>
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
      <div className="mt-auto flex justify-end">
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

/** Mirrors `CalendarPeek`: title + two match rows (last played + next up). */
function CalendarPeekSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-32 self-start sm:self-auto" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <div className="flex items-baseline justify-between gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Skeleton className="h-5 w-7 shrink-0 rounded-xs" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            </div>
            <Skeleton className="h-5 w-10 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-row-reverse items-center gap-2">
              <Skeleton className="h-5 w-7 shrink-0 rounded-xs" />
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mirrors `ManagementTabs`: title + 3-tab segmented control + first-tab content. */
function ManagementTabsSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
