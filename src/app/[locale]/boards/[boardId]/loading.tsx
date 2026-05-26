import type { ReactNode } from "react";

import { LEADERBOARD_PAGE_SIZE } from "@/features/competitions/api/competitions";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export default function BoardLoading() {
  return (
    <section className="container pt-6 pb-8 lg:pt-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="flex w-full flex-col gap-4 lg:w-100 lg:shrink-0">
          <div className="flex w-full items-center gap-2.5 rounded-xl border border-foreground/10 bg-card px-4 py-3 shadow-xs">
            <Skeleton className="size-11 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="size-4 shrink-0 rounded-sm" />
          </div>

          <Card className="gap-0 overflow-hidden border border-foreground/10 p-0 ring-0">
            <div className="flex items-center gap-2.5 bg-muted/50 px-4 py-3">
              <Skeleton className="size-11 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="size-4 shrink-0 rounded-sm" />
            </div>
            <ScopeRowSkeleton labelWidth="w-16">
              <Skeleton className="h-5 w-20 rounded-md" />
            </ScopeRowSkeleton>
            <ScopeRowSkeleton labelWidth="w-24">
              <div className="flex gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-3.5 w-5 rounded-xs" />
                ))}
              </div>
            </ScopeRowSkeleton>
            <div className="grid grid-cols-2 divide-x divide-border/60 border-t border-border/60">
              <StatSkeleton />
              <StatSkeleton />
            </div>
          </Card>

          <Card className="relative overflow-hidden py-5">
            <span className="absolute top-3 left-4">
              <Skeleton className="h-3 w-12" />
            </span>
            <CardContent className="mx-auto grid w-full max-w-md grid-cols-3 items-end gap-2 px-3 pt-8 pb-0">
              <PodiumStepSkeleton avatar="size-12" pedestal="h-14" />
              <PodiumStepSkeleton avatar="size-14" pedestal="h-20" />
              <PodiumStepSkeleton avatar="size-12" pedestal="h-11" />
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 flex-1">
          <Card size="sm">
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                <div className="flex flex-1 items-baseline gap-3">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="ml-auto h-3 w-20" />
                </div>
                <Skeleton className="h-9 w-full rounded-md md:w-64 lg:w-72" />
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="w-12 px-3 py-2 text-left">
                        <Skeleton className="h-2.5 w-4" />
                      </th>
                      <th className="px-3 py-2 text-left">
                        <Skeleton className="h-2.5 w-16" />
                      </th>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <th key={i} className="w-18 px-3 py-2">
                          <Skeleton className="ml-auto h-2.5 w-9" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: LEADERBOARD_PAGE_SIZE }).map((_, i) => (
                      <tr key={i} className="border-b border-border/60 last:border-b-0">
                        <td className="px-3 py-2.5">
                          <Skeleton className="h-4 w-5" />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Skeleton className="size-7 shrink-0 rounded-full" />
                            <div className="flex min-w-0 flex-col gap-1.5">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-2.5 w-20" />
                            </div>
                          </div>
                        </td>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-3 py-2.5">
                            <Skeleton className="ml-auto h-4 w-8" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border px-2 pb-2">
                  <Skeleton className="h-2.5 w-6" />
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ScopeRowSkeleton({ labelWidth, children }: { labelWidth: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-border/60 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className={cn("h-3.5", labelWidth)} />
        <Skeleton className="ml-auto h-3 w-12" />
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-2.5">
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-6 w-12" />
    </div>
  );
}

function PodiumStepSkeleton({ avatar, pedestal }: { avatar: string; pedestal: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-1.5">
      <Skeleton className={cn("rounded-full", avatar)} />
      <div className="flex w-full flex-col items-center gap-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-2.5 w-10" />
      </div>
      <Skeleton className={cn("w-full rounded-t-md", pedestal)} />
    </div>
  );
}
