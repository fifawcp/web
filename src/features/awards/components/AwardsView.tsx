"use client";

import { useTranslations } from "next-intl";

import { TOURNAMENT_START_DATE } from "@/features/dashboard/lib/tournamentConfig";
import { DismissibleNotice } from "@/shared/components/DismissibleNotice";

import { useAwards } from "../hooks/useAwards";
import { useAwardsEditor } from "../hooks/useAwardsEditor";
import { awardsLocked, AWARD_TYPES, AWARDS_TOTAL, filledPicks, findPick } from "../lib/awards";
import type { UserAwards } from "../types/awards.types";

import { AwardCard } from "./AwardCard";
import { AwardsActionBar } from "./AwardsActionBar";
import { AwardsHeader } from "./AwardsHeader";
import { AwardsLockedBanner } from "./AwardsLockedBanner";

type Props = {
  initialData: UserAwards;
};

const CONTAINER = "container flex flex-col gap-6 pt-6 pb-10 lg:pt-8 lg:pb-12";

/**
 * Awards orchestrator. Edits are session-local (React Query cache via
 * `useAwardsEditor`) and committed with an explicit Save — no localStorage
 * draft, so a fresh page load always reflects the server's authoritative
 * picks (no cross-device staleness).
 */

export function AwardsView({ initialData }: Props) {
  const t = useTranslations("awards");
  const { data = initialData } = useAwards(initialData);
  const { select, clear, reset, save, isSaving } = useAwardsEditor();

  const isLocked = awardsLocked(data.is_locked, TOURNAMENT_START_DATE);
  const total = data.progress?.total ?? AWARDS_TOTAL;
  const completed = filledPicks(data.picks).length;

  return (
    <div className={CONTAINER}>
      <AwardsHeader completed={completed} total={total} locksAt={TOURNAMENT_START_DATE} isLocked={isLocked} />

      <AwardsActionBar remaining={total - completed} canReset={completed > 0} isSaving={isSaving} isLocked={isLocked} onReset={reset} onSave={save} />

      {isLocked && <AwardsLockedBanner />}

      {/* The "list isn't final yet" note only matters while picks are editable. */}
      {!isLocked && (
        <DismissibleNotice tone="amber" dismissLabel={t("disclaimer.dismiss")}>
          {t("disclaimer.body")}
        </DismissibleNotice>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {AWARD_TYPES.map((awardType) => (
          <AwardCard
            key={awardType}
            awardType={awardType}
            pick={findPick(data.picks, awardType)}
            isLocked={isLocked}
            onSelect={(player) => select(awardType, player)}
            onClear={() => clear(awardType)}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{t("footnote")}</p>
    </div>
  );
}
