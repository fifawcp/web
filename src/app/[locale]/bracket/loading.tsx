import { BracketTreeSkeleton } from "@/features/pickems/components/PickemsSkeleton";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Skeleton mirroring the Bracket layout (§2.1): the page header, then the exact
 * knockout-tree skeleton the pickems bracket uses — the compact 5-column tree
 * (mobile → lg, horizontally scrolled) and the xl split/folded 9-column tree.
 * Reusing `BracketTreeSkeleton` keeps it 1:1 with the live `BracketTree`.
 *
 * Renders the guest baseline (no compare toggle / legend — both are gated), so
 * nothing phantoms in and shifts the tree after hydration.
 */
export default function BracketLoading() {
  return (
    <div className="container mx-auto flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-44 sm:h-10" />
        <Skeleton className="h-20 w-full max-w-2xl" />
      </header>

      <BracketTreeSkeleton />
    </div>
  );
}
