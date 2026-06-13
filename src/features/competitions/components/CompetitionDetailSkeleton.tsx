import { Skeleton } from "@/shared/components/ui/skeleton";

import { LEADERBOARD_PAGE_SIZE } from "../api/competitions";
import type { CompetitionType } from "../types/competitions.types";

type Props = {
  // Drives which layout to mirror. Undefined — the route-level loading boundary, which
  // runs before the type is known — falls back to a type-agnostic shell so it never
  // flashes the wrong layout (e.g. a leaderboard table on a pick breakdown page).
  type?: CompetitionType;
};

// Full-page loading skeleton for the competition detail route. `pick` competitions
// render the match breakdown; `match` adds the "how the board predicted" card above
// the leaderboard; every type mirrors its real layout 1:1 to avoid a hydration jump.
export function CompetitionDetailSkeleton({ type }: Props) {
  return (
    <section className="container flex flex-col gap-5 pt-6 pb-8 lg:pt-8">
      <Skeleton className="h-5 w-32" />

      {type === undefined ? <NeutralHeaderSkeleton /> : type === "pick" ? <PickHeaderSkeleton /> : <LeaderboardHeaderSkeleton />}

      {type === undefined ? <NeutralBodySkeleton /> : type === "pick" ? <BreakdownBodySkeleton /> : <LeaderboardBodySkeleton showRevealList={type === "match"} />}
    </section>
  );
}

// ---- Headers ----

// Type-agnostic header: icon + title + a right-side action, the shape shared by every
// competition type, so the swap to the real header doesn't shift the layout.
function NeutralHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-4 lg:pb-5">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-lg sm:size-12" />
        <Skeleton className="h-7 w-40 sm:w-52" />
      </div>
      <Skeleton className="h-9 w-24 shrink-0 rounded-md" />
    </div>
  );
}

function PickHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-4 lg:pb-5">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-lg sm:size-12" />
        <Skeleton className="h-7 w-40 sm:w-48" />
      </div>
      <Skeleton className="h-9 w-24 shrink-0 rounded-md" />
    </div>
  );
}

function LeaderboardHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      <div className="flex min-w-0 items-start gap-3">
        <Skeleton className="size-12 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-3.5 w-40" />
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
  );
}

// ---- Neutral body (route-level boundary, type still unknown) ----

function NeutralBodySkeleton() {
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-2">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

// ---- Pick breakdown body ----

function BreakdownBodySkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <BreakdownMatchCardSkeleton />
        <BreakdownStatsCardSkeleton />
      </div>
      <MemberTableSkeleton />
    </div>
  );
}

function BreakdownMatchCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-5 sm:gap-4">
        <TeamSideSkeleton align="start" />
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-8 w-20 sm:h-10 sm:w-24" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <TeamSideSkeleton align="end" />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
    </div>
  );
}

function TeamSideSkeleton({ align }: { align: "start" | "end" }) {
  const isHome = align === "start";
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${isHome ? "flex-row" : "flex-row-reverse"}`}>
      <Skeleton className="h-7 w-10 shrink-0 rounded-xs sm:h-11 sm:w-16" />
      <div className={`flex flex-col gap-1.5 ${isHome ? "items-start" : "items-end"}`}>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-2.5 w-8" />
      </div>
    </div>
  );
}

function BreakdownStatsCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-full rounded-lg" />
        <ul className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="h-3.5 w-16" />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2.5 border-t border-border pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-muted px-3 py-3 sm:py-4">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberTableSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-full rounded-md sm:w-64" />
      </div>

      <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-muted/40 p-3">
        <Skeleton className="h-2.5 w-16" />
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-2">
              <Skeleton className="h-5 w-8 rounded-md" />
              <Skeleton className="h-3.5 w-12" />
            </li>
          ))}
        </ul>
      </div>

      <Skeleton className="h-9 w-full rounded-md sm:w-72 sm:self-end" />

      <div className="overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-xs">
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-3 py-2.5">
          <Skeleton className="h-2.5 w-5" />
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="ml-auto h-2.5 w-16" />
          <Skeleton className="h-2.5 w-10" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border/60 px-3 py-2.5 last:border-b-0">
            <Skeleton className="h-3.5 w-5 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-4 w-14 shrink-0" />
            <Skeleton className="h-5 w-9 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- Leaderboard body (match / pickem / awards) ----

function LeaderboardBodySkeleton({ showRevealList }: { showRevealList: boolean }) {
  return (
    <>
      {showRevealList ? <RevealListSkeleton /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full rounded-md sm:w-72" />
      </div>

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
                {showRevealList ? <th className="w-12" /> : null}
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
                  {showRevealList ? (
                    <td className="px-2">
                      <Skeleton className="mx-auto size-7 rounded-md" />
                    </td>
                  ) : null}
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
    </>
  );
}

// Mirrors the "how the board predicted" card (custom competitions): heading + a list
// of revealable match rows (flag · code · score · code · flag, status, chevron).
function RevealListSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-foreground/10 bg-card p-4 shadow-xs">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-3 w-60" />
      </div>
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Skeleton className="h-4 w-6 rounded-xs" />
              <Skeleton className="h-4 w-9" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-9" />
              <Skeleton className="h-4 w-6 rounded-xs" />
            </div>
            <Skeleton className="hidden h-3 w-12 sm:block" />
            <Skeleton className="size-4 shrink-0 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
