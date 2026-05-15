import { Suspense } from "react";

import { getDashboardStats, getUserPickemSummary } from "../api/dashboard.api";
import type { PickemProgress } from "../types/dashboard.types";

import { AuthHero } from "./AuthHero";
import { GuestHero } from "./GuestHero";
import { HeroSkeleton } from "./HeroSkeleton";

type Props = {
  isLoggedIn: boolean;
};

function isAllPickemComplete(progress: PickemProgress): boolean {
  return progress.groups.is_complete && progress.best_thirds.is_complete && progress.bracket.is_complete;
}

async function AuthHeroContent() {
  const [stats, pickem] = await Promise.all([getDashboardStats(), getUserPickemSummary()]);
  const complete = pickem ? isAllPickemComplete(pickem.progress) : false;
  return <AuthHero stats={stats} isPickemComplete={complete} />;
}

export function HeroSection({ isLoggedIn }: Props) {
  return (
    <section className="relative overflow-hidden bg-muted/30 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        {isLoggedIn ? (
          <Suspense fallback={<HeroSkeleton />}>
            <AuthHeroContent />
          </Suspense>
        ) : (
          <GuestHero />
        )}
      </div>
    </section>
  );
}
