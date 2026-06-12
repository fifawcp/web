import { Skeleton } from "@/shared/components/ui/skeleton";

// Mirrors the member view: back link, identity header, tabs, then the first
// (Groups) section grid — so nothing shifts when the data resolves.
export default function MemberPicksLoading() {
  return (
    <section className="container flex flex-col gap-6 pt-6 pb-10 lg:pt-8 lg:pb-12">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex gap-4 border-b border-border pb-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-32" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
