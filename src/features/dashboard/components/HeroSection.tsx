import type { DashboardStats, Match, PickemProgress, Team } from "../types/dashboard.types";

import { AuthHero } from "./AuthHero";
import { GuestHero } from "./GuestHero";

type Props = {
  isLoggedIn: boolean;
  pickedChampion: Team | null;
  stats: DashboardStats | null;
  nextMatch: Match | null;
  pickemProgress: PickemProgress | null;
};

export function HeroSection({ isLoggedIn, pickedChampion, stats, nextMatch, pickemProgress }: Props) {
  return (
    <section className="relative overflow-hidden bg-muted/30 dark:bg-zinc-950">
      <div className="container pt-6 pb-8 lg:pt-8 lg:pb-12">
        {isLoggedIn ? <AuthHero pickedChampion={pickedChampion} stats={stats} nextMatch={nextMatch} pickemProgress={pickemProgress} /> : <GuestHero />}
      </div>
    </section>
  );
}
