import { BannerSection, DescriptionSection, FinalSection } from "@/features/landing";

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      <BannerSection />
      <DescriptionSection />
      <FinalSection />
    </div>
  );
}
