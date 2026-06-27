import { Skeleton } from "@/shared/components/ui/skeleton";

// Mirrors MemberPickemView 1:1 — back link, identity header, stat pills, and the
// three stacked sections (groups grid, thirds grid, bracket) — to avoid layout
// shift when the real content resolves.
export function MemberPickemSkeleton() {
  return (
    <section className="container flex flex-col gap-6 pt-6 pb-10 lg:pt-8 lg:pb-12">
      <Skeleton className="h-5 w-32" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:max-w-sm">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <SectionSkeleton>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </div>
        </SectionSkeleton>

        <SectionSkeleton>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </SectionSkeleton>

        <SectionSkeleton>
          <Skeleton className="h-72 rounded-xl" />
        </SectionSkeleton>
      </div>
    </section>
  );
}

function SectionSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-6 w-28" />
      </div>
      {children}
    </section>
  );
}
