import { Fragment } from "react";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

import type { PickemStep } from "../types/pickems.types";

type Props = {
  /** Which step's content to mirror. Defaults to "groups" since that's where
   *  `app/pickems/loading.tsx` lands when the URL has no `?step=`. */
  step?: PickemStep;
};

/**
 * Mirrors the layout of the active step so the transition into real content
 * doesn't shift. Used by `app/pickems/loading.tsx` (reads `?step=` and passes
 * it in) and `PickemsView`'s hydration fallback.
 */
export function PickemsSkeleton({ step = "groups" }: Props = {}) {
  return (
    <>
      <PageHeaderSkeleton />
      <StepperSkeleton />
      {step === "groups" && <GroupsStepSkeleton />}
      {step === "thirds" && <ThirdsStepSkeleton />}
      {step === "bracket" && <BracketStepSkeleton />}
    </>
  );
}

function PageHeaderSkeleton() {
  // Mirrors the live desktop rail: two same-width buttons over a helper line /
  // count / bar. Every step uses w-44 sm-height buttons so the skeleton stays
  // identical regardless of which step is loading.
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-8 w-72 sm:h-9 sm:w-80" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="hidden flex-col items-stretch gap-2.5 lg:flex">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-8 w-44 rounded-md" />
          <Skeleton className="h-8 w-44 rounded-md" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

function StepperSkeleton() {
  return (
    <div className="flex w-full items-start rounded-xl border bg-card px-3 py-3 sm:px-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Fragment key={i}>
          <div className="flex shrink-0 flex-col items-center gap-1.5 sm:flex-row sm:items-start sm:gap-2.5">
            <Skeleton className="size-7 shrink-0 rounded-full" />
            <div className="space-y-1.5 sm:pt-0.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          </div>
          {i < 2 && <Skeleton className="mx-2 mt-3.5 h-px flex-1 self-start sm:mx-4" />}
        </Fragment>
      ))}
    </div>
  );
}

function GroupsStepSkeleton() {
  return (
    <>
      <TipsCardSkeleton />
      <GroupsHeadingSkeleton />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <GroupCardSkeleton key={i} expanded={i === 0} />
        ))}
      </div>
    </>
  );
}

function ThirdsStepSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <BestThirdTileSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function BracketStepSkeleton() {
  return (
    <>
      <BracketMobileSkeleton />
      <BracketCompactSkeleton />
      <BracketSplitSkeleton />
    </>
  );
}

function BracketMobileSkeleton() {
  return (
    <div className="space-y-4 lg:hidden">
      <div className="grid grid-cols-6 gap-1 rounded-xl border bg-card p-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5 rounded-md px-2 py-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-2 w-6" />
          </div>
        ))}
      </div>
      <div className="flex items-baseline justify-between px-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <ul className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i}>
            <BracketMatchCardSkeleton showHeader />
          </li>
        ))}
      </ul>
    </div>
  );
}

const COMPACT_COLUMNS = [
  { count: 16, rowSpan: 1 },
  { count: 8, rowSpan: 2 },
  { count: 4, rowSpan: 4 },
  { count: 2, rowSpan: 8 },
] as const;

function BracketCompactSkeleton() {
  return (
    <div className="hidden lg:block xl:hidden">
      <div className="mb-3 grid grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <BracketColumnHeaderSkeleton key={i} paddedLeft={i > 0} paddedRight={i < 4} />
        ))}
      </div>
      <div className="grid grid-cols-5 grid-rows-[repeat(16,minmax(2.75rem,1fr))]">
        {COMPACT_COLUMNS.map((col, colIdx) =>
          Array.from({ length: col.count }).map((_, matchIdx) => (
            <div
              key={`${colIdx}-${matchIdx}`}
              className="flex items-center px-1.5 py-1.5"
              style={{ gridColumnStart: colIdx + 1, gridRowStart: matchIdx * col.rowSpan + 1, gridRowEnd: `span ${col.rowSpan}` }}
            >
              <BracketMatchCardSkeleton dense />
            </div>
          ))
        )}
        <BracketCenterColumnSkeleton colStart={5} />
      </div>
    </div>
  );
}

const SPLIT_COLUMNS = [
  { count: 8, rowSpan: 2, colStart: 1 },
  { count: 4, rowSpan: 4, colStart: 2 },
  { count: 2, rowSpan: 8, colStart: 3 },
  { count: 1, rowSpan: 16, colStart: 4 },
  { count: 1, rowSpan: 16, colStart: 6 },
  { count: 2, rowSpan: 8, colStart: 7 },
  { count: 4, rowSpan: 4, colStart: 8 },
  { count: 8, rowSpan: 2, colStart: 9 },
] as const;

function BracketSplitSkeleton() {
  return (
    <div className="hidden xl:block">
      <div className="mb-3 grid grid-cols-9">
        {SPLIT_COLUMNS.map((col) => (
          <BracketColumnHeaderSkeleton key={col.colStart} colStart={col.colStart} />
        ))}
        <BracketColumnHeaderSkeleton colStart={5} gridRow={1} />
      </div>
      <div className="grid grid-cols-9 grid-rows-[repeat(16,minmax(2.75rem,1fr))]">
        {SPLIT_COLUMNS.map((col) =>
          Array.from({ length: col.count }).map((_, matchIdx) => (
            <div
              key={`${col.colStart}-${matchIdx}`}
              className="flex items-center px-1.5 py-1.5"
              style={{ gridColumnStart: col.colStart, gridRowStart: matchIdx * col.rowSpan + 1, gridRowEnd: `span ${col.rowSpan}` }}
            >
              <BracketMatchCardSkeleton dense />
            </div>
          ))
        )}
        <BracketCenterColumnSkeleton colStart={5} />
      </div>
    </div>
  );
}

function BracketCenterColumnSkeleton({ colStart }: { colStart: number }) {
  return (
    <div className="flex flex-col justify-center gap-3 px-1.5" style={{ gridColumnStart: colStart, gridRow: "1 / span 16" }}>
      <BracketMatchCardSkeleton dense withTopBar />
      <BracketChampionSkeleton />
      <BracketMatchCardSkeleton dense withTopBar />
    </div>
  );
}

function BracketColumnHeaderSkeleton({
  colStart,
  gridRow,
  paddedLeft,
  paddedRight,
}: {
  colStart?: number;
  gridRow?: number;
  paddedLeft?: boolean;
  paddedRight?: boolean;
}) {
  return (
    <header
      className={cn("flex flex-col items-center gap-0.5 px-1.5", paddedLeft && "pl-5", paddedRight && "pr-5")}
      style={colStart ? { gridColumnStart: colStart, gridRowStart: gridRow } : undefined}
    >
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-6" />
      <Skeleton className="mt-1 h-px w-full" />
    </header>
  );
}

function BracketChampionSkeleton() {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-card px-2 py-2.5">
      <Skeleton className="h-2.5 w-16" />
    </div>
  );
}

function TipsCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <TipCardSkeleton />
      <TipCardSkeleton />
    </div>
  );
}

function TipCardSkeleton() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-3 py-3">
      <Skeleton className="mt-0.5 size-5 shrink-0 rounded-sm" />
      <div className="min-w-0 flex-1 space-y-1.5 pt-1">
        <Skeleton className="h-3.5 w-full max-w-xs" />
        <Skeleton className="h-3.5 w-3/4 max-w-[12rem]" />
      </div>
      <Skeleton className="size-6 shrink-0 rounded-md" />
    </div>
  );
}

function GroupsHeadingSkeleton() {
  return (
    <div className="flex items-center justify-between pt-1 md:hidden">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-9 w-32 rounded-md" />
    </div>
  );
}

function GroupCardSkeleton({ expanded }: { expanded: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="h-5 w-16" />
        {!expanded && (
          <div className="grid min-w-0 flex-1 grid-cols-4 items-center gap-1.5 pl-3 md:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-2.5 w-10 justify-self-center" />
            ))}
          </div>
        )}
        <Skeleton className="ml-auto hidden h-3 w-20 md:block" />
        <Skeleton className="ml-2 size-4 shrink-0 md:hidden" />
      </div>

      <div className={cn("space-y-1 border-t border-border bg-zinc-50 px-3 py-3 dark:bg-zinc-900/40 md:block", !expanded && "hidden")}>
        {Array.from({ length: 4 }).map((_, i) => (
          <TeamRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function TeamRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-2.5 py-2">
      <Skeleton className="size-4 shrink-0" />
      <Skeleton className="size-6 shrink-0 rounded-full" />
      <Skeleton className="h-6 w-9 shrink-0 rounded-xs" />
      <Skeleton className="h-4 max-w-32 flex-1" />
      <Skeleton className="size-4 shrink-0" />
    </div>
  );
}

function BestThirdTileSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3">
      <Skeleton className="size-5 shrink-0 rounded-md" />
      <Skeleton className="h-6 w-9 shrink-0 rounded-xs" />
      <Skeleton className="h-4 max-w-32 flex-1" />
      <Skeleton className="h-3 w-12 shrink-0" />
    </div>
  );
}

function BracketMatchCardSkeleton({ dense = false, showHeader = false, withTopBar = false }: { dense?: boolean; showHeader?: boolean; withTopBar?: boolean }) {
  const rowClass = dense ? "py-1.5" : "py-2.5";
  const flagClass = dense ? "h-3.5 w-5" : "h-5 w-8";
  const gapClass = dense ? "gap-1" : "gap-2";

  return (
    <div className="w-full overflow-hidden rounded-md border bg-card">
      {withTopBar && (
        <div className="flex items-center justify-center border-b border-border/60 px-2 py-1.5">
          <Skeleton className="h-2.5 w-12" />
        </div>
      )}
      {showHeader && !withTopBar && (
        <div className="flex items-center justify-between border-b border-border px-3 py-1">
          <Skeleton className="h-2.5 w-6" />
          <Skeleton className="h-2.5 w-8" />
        </div>
      )}
      <div className={cn("flex items-center px-2.5", rowClass, gapClass)}>
        <Skeleton className={cn("shrink-0 rounded-xs", flagClass)} />
        <Skeleton className="h-3 max-w-24 flex-1" />
      </div>
      <div className="h-px bg-border" />
      <div className={cn("flex items-center px-2.5", rowClass, gapClass)}>
        <Skeleton className={cn("shrink-0 rounded-xs", flagClass)} />
        <Skeleton className="h-3 max-w-24 flex-1" />
      </div>
    </div>
  );
}
