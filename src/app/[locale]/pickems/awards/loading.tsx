import { AwardsSkeleton } from "@/features/awards/components/AwardsSkeleton";

const CONTAINER = "container flex flex-col gap-6 pt-6 pb-10 lg:pt-8 lg:pb-12";

export default function AwardsLoading() {
  return (
    <div className={CONTAINER}>
      <AwardsSkeleton />
    </div>
  );
}
