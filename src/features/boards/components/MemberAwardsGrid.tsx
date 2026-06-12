"use client";

import { AwardCard } from "@/features/awards/components/AwardCard";
import { AWARD_TYPES, findPick } from "@/features/awards/lib/awards";
import type { UserAwards } from "@/features/awards/types/awards.types";

const noop = () => {};

type Props = { awards: UserAwards };

/**
 * Read-only grid of another member's award picks. Reuses `AwardCard` in its
 * locked state (no select / clear), so it renders identically to the owner's
 * own locked awards.
 */
export function MemberAwardsGrid({ awards }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {AWARD_TYPES.map((awardType) => (
        <AwardCard key={awardType} awardType={awardType} pick={findPick(awards.picks, awardType)} isLocked onSelect={noop} onClear={noop} />
      ))}
    </div>
  );
}
