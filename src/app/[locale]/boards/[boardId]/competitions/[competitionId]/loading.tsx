import { CompetitionDetailSkeleton } from "@/features/competitions/components/CompetitionDetailSkeleton";

// Route-level boundary, shown during the guard reads — before the competition type is
// known. The Suspense fallback in the page swaps to the type-specific skeleton next.
export default function CompetitionDetailLoading() {
  return <CompetitionDetailSkeleton />;
}
