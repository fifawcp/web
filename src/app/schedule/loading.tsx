import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ScheduleLoading() {
  return (
    <div className="flex flex-col">
      <div className="container mx-auto flex w-full flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <ProgressCardSkeleton />
        </div>
        <div className="hidden lg:block">
          <StatsBoardSkeleton />
        </div>
      </div>
      <FilterBarSkeleton />
      <div className="container mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <DateGroupSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

const CHIP_SKELETON_WIDTHS = ["w-44", "w-32", "w-60", "w-44"];

function ProgressCardSkeleton() {
  return (
    <Card size="sm" className="flex-row items-center gap-4 px-4">
      <Skeleton className="size-20 shrink-0 rounded-full sm:size-24" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-32" />
        <div className="mt-2 flex items-center gap-2.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </Card>
  );
}

function StatsBoardSkeleton() {
  return (
    <Card size="sm" className="flex-row items-center gap-5 px-5 py-3">
      <div className="flex min-w-64 xl:min-w-80 shrink-0 items-center gap-4">
        <Skeleton className="size-24 shrink-0 rounded-full" />
        <div className="flex flex-col gap-0.5">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-28" />
          <div className="mt-1.5 flex items-center gap-2.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      <div className="h-20 w-px shrink-0 bg-border" />
      <div className="flex flex-1 items-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="contents">
            <div className="flex flex-1 items-center gap-3 px-3">
              <Skeleton className="size-10 shrink-0 rounded-lg" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-4 w-full max-w-24" />
              </div>
            </div>
            {i < 2 && <div className="h-20 w-px shrink-0 bg-border" />}
          </div>
        ))}
      </div>
    </Card>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-border py-2">
        <div className="hidden flex-wrap items-center gap-2 lg:flex">
          {CHIP_SKELETON_WIDTHS.map((w, i) => (
            <Skeleton key={i} className={`h-8 ${w} rounded-lg`} />
          ))}
        </div>
        <div className="flex w-full lg:hidden">
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-7 flex-1 rounded-md lg:flex-none lg:min-w-40" />
          ))}
        </div>
      </div>
    </div>
  );
}

function DateGroupSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1 py-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function MatchCardSkeleton() {
  return (
    <Card className="gap-3 px-4 py-4" size="sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-14" />
      </div>

      <div className="grid min-h-20 grid-cols-[1fr_6rem_1fr] items-center gap-3 sm:grid-cols-[1fr_12rem_1fr]">
        <TeamRowSkeleton side="home" />
        <Skeleton className="mx-auto h-7 w-16" />
        <TeamRowSkeleton side="away" />
      </div>

      <div className="-mx-4 flex min-h-9 items-center justify-between gap-3 border-t border-border px-4 pt-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </Card>
  );
}

function TeamRowSkeleton({ side }: { side: "home" | "away" }) {
  const justify = side === "home" ? "justify-start" : "justify-end";
  const flag = <Skeleton className="h-6 w-9 shrink-0 rounded-xs sm:h-9 sm:w-13" />;
  const label = (
    <div className={`flex flex-col leading-tight ${side === "home" ? "items-start" : "items-end"}`}>
      <Skeleton className="h-3 w-16 sm:h-4" />
      <Skeleton className="h-3 w-8" />
    </div>
  );

  return (
    <div className={`flex items-center gap-1.5 sm:gap-3 ${justify}`}>
      {side === "home" ? (
        <>
          {flag}
          {label}
        </>
      ) : (
        <>
          {label}
          {flag}
        </>
      )}
    </div>
  );
}
