import { BannerSection, DescriptionSection, FinalSection } from "@features/home";

export default function Home() {
  return (
    <div className="flex flex-col">
      <BannerSection />
      <DescriptionSection />
      <FinalSection />
    </div>
  );
}
