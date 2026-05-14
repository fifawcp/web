import { HeroSection } from "./HeroSection";
import { LeaderboardSection } from "./LeaderboardSection";
import { PickStatusSection } from "./PickStatusSection";
import { TutorialSection } from "./TutorialSection";

type Props = {
  isLoggedIn: boolean;
};

export function DashboardView({ isLoggedIn }: Props) {
  return (
    <div className="flex flex-col">
      <HeroSection isLoggedIn={isLoggedIn} />

      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <PickStatusSection isLoggedIn={isLoggedIn} />
            </div>
            <div className="flex-1">
              <LeaderboardSection isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </div>
      </section>

      <TutorialSection isLoggedIn={isLoggedIn} />
    </div>
  );
}
