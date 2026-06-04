import { LEADERBOARD_PAGE_SIZE } from "@/features/competitions/api/competitions";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function CompetitionDetailLoading() {
  return (
    <section className="container flex flex-col gap-5 pt-6 pb-8 lg:pt-8">
      {/* Back link */}
      <Skeleton className="h-5 w-32" />

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 items-start gap-3">
            <Skeleton className="size-12 shrink-0 rounded-lg" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-3.5 w-40" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Skeleton className="h-12 w-full rounded-lg sm:w-28" />
            <Skeleton className="h-12 w-full rounded-lg sm:w-28" />
          </div>
          <div className="flex flex-col items-stretch gap-2.5 sm:items-end">
            <Skeleton className="h-4 w-24 self-center sm:self-end" />
            <Skeleton className="h-8 w-full rounded-md sm:w-36" />
          </div>
        </div>
      </div>

      {/* Search row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full rounded-md sm:w-72" />
      </div>

      {/* Leaderboard table */}
      <div className="overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-xs">
        <div className="hidden md:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-12 px-4 py-2.5">
                  <Skeleton className="mx-auto h-2.5 w-4" />
                </th>
                <th className="px-4 py-2.5 text-left">
                  <Skeleton className="h-2.5 w-16" />
                </th>
                {Array.from({ length: 4 }).map((_, i) => (
                  <th key={i} className="px-4 py-2.5">
                    <Skeleton className="mx-auto h-2.5 w-10" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: LEADERBOARD_PAGE_SIZE }).map((_, i) => (
                <tr key={i} className="border-b border-border/60 last:border-b-0">
                  <td className="px-4 py-2.5">
                    <Skeleton className="mx-auto h-4 w-5" />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </td>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-2.5">
                      <Skeleton className="mx-auto h-4 w-8" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 md:hidden">
          <ul className="divide-y divide-border">
            {Array.from({ length: LEADERBOARD_PAGE_SIZE }).map((_, i) => (
              <li key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-2 py-2.5">
                <span className="w-9">
                  <Skeleton className="h-3.5 w-6" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
                <span className="flex w-24 justify-center">
                  <Skeleton className="h-4 w-10" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
