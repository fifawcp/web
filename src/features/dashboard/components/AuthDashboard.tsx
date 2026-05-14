import { AuthHeroSection } from "./AuthHeroSection";
import { GlobalTop5Section } from "./GlobalTop5Section";
import { PickStatusSection } from "./PickStatusSection";
import { TutorialSection } from "./TutorialSection";

export function AuthDashboard() {
  return (
    <div className="flex flex-col">
      <AuthHeroSection />

      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <PickStatusSection />
          </div>
          <div className="flex-1">
            <GlobalTop5Section />
          </div>
        </div>
      </div>

      {/* Tutorial section */}
      <TutorialSection isLoggedIn />
    </div>
  );
}
