import { BannerSection, DescriptionSection, FinalSection } from "@/components/home";

export default function Home() {
  return (
    <div className="flex flex-col">
      <BannerSection />
      <DescriptionSection />
      <FinalSection />
    </div>
  );
}
