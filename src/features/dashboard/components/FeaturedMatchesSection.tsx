"use client";

import { cn } from "@/shared/lib/utils";

import type { Match } from "../types/dashboard.types";

import { FeaturedMatchCard } from "./FeaturedMatchCard";

type Props = {
  // Upcoming match(es) sharing the earliest kickoff — usually one, occasionally a
  // pair of simultaneous group-stage finales.
  matches: Match[];
  isLoggedIn: boolean;
  className?: string;
};

// "What to do next" — one featured card, or a card per simultaneous match. A single
// match keeps the full-width hero treatment; two or more split into a responsive grid
// (stacked until xl, two columns beyond it) so every actionable match stays visible and
// neither card gets cramped at the narrower lg dashboard column width. With an odd count
// (rare: 3+ simultaneous matches) the trailing card spans the full row instead of sitting
// alone at half width.
export function FeaturedMatchesSection({ matches, isLoggedIn, className }: Props) {
  if (matches.length === 0) return null;

  if (matches.length === 1) {
    return <FeaturedMatchCard match={matches[0]} isLoggedIn={isLoggedIn} delay={0} className={className} />;
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4 xl:grid-cols-2 [&>*:last-child:nth-child(odd)]:xl:col-span-2", className)}>
      {matches.map((match, index) => (
        <FeaturedMatchCard key={match.id} match={match} isLoggedIn={isLoggedIn} delay={index * 0.06} className="h-full" compact />
      ))}
    </div>
  );
}
