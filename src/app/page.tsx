"use client";

import { BannerSection, DescriptionSection, FinalSection } from "@/features/landing";
import { GuestOnlyRoute } from "@/shared/routes/guest-only-route";

export default function Home() {
  return (
    <GuestOnlyRoute>
      <div className="flex flex-col overflow-x-hidden">
        <BannerSection />
        <DescriptionSection />
        <FinalSection />
      </div>
    </GuestOnlyRoute>
  );
}
