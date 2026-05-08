import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ScheduleLoading() {
  return (
    <div className="flex flex-col">
      <FilterBarSkeleton />
      <div className="container mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <DateGroupSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

const CHIP_SKELETON_WIDTHS = ["w-52", "w-32", "w-60", "w-44"];

function FilterBarSkeleton() {
  return (
    <div className="border-b border-border">
      <div className="container mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <div className="hidden flex-wrap items-center gap-2 lg:flex">
          {CHIP_SKELETON_WIDTHS.map((w, i) => (
            <Skeleton key={i} className={`h-8 ${w} rounded-full`} />
          ))}
        </div>
        <div className="flex w-full lg:hidden">
          <Skeleton className="h-8 w-full rounded-md" />
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
    <div className={`flex flex-col gap-1.5 ${side === "home" ? "items-start" : "items-end"}`}>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-2 w-8" />
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
