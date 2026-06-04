import { Skeleton } from "@/shared/components/ui/skeleton";

export default function BoardLoading() {
  return (
    <section className="container flex flex-col gap-5 pt-6 pb-8 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-6 w-44" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <div className="flex items-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="-ml-1.5 size-9 rounded-full ring-2 ring-background first:ml-0" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>

      {/* Tabs + toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4 border-b border-border pb-2.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-full rounded-md sm:w-56" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Card grid */}
      <div className="grid auto-rows-fr grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-full flex-col gap-3 rounded-xl border border-foreground/10 bg-card p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="min-h-36 flex-1 rounded-lg" />
            <div className="mt-auto flex items-center justify-between pt-1">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
