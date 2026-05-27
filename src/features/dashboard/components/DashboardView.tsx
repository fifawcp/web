import type { DashboardData } from "../types/dashboard.types";

import { HeroSection } from "./HeroSection";
import { LeaderboardSection } from "./LeaderboardSection";
import { PickStatusSection } from "./PickStatusSection";
import { TutorialSection } from "./TutorialSection";

type Props = {
  isLoggedIn: boolean;
  data: DashboardData | null;
  currentUserId: string | null;
};

export function DashboardView({ isLoggedIn, data, currentUserId }: Props) {
  return (
    <div className="relative flex flex-col">
      <HeroSection
        isLoggedIn={isLoggedIn}
        pickedChampion={data?.picked_champion ?? null}
        stats={data?.stats ?? null}
        nextMatch={data?.next_match ?? null}
        pickemProgress={data?.progress.pickem ?? null}
      />

      <section className="border-t border-border">
        <div className="container py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <PickStatusSection isLoggedIn={isLoggedIn} progress={data?.progress ?? null} />
            </div>
            <div className="flex-1">
              <LeaderboardSection leaderboard={data?.leaderboard ?? null} currentUserId={currentUserId} />
            </div>
          </div>
        </div>
      </section>

      <TutorialSection isLoggedIn={isLoggedIn} />
    </div>
  );
}
