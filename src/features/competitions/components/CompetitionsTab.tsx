"use client";

import { useMemo } from "react";
import { Flame, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AwardType } from "@/features/awards/types/awards.types";
import type { PickemProgress } from "@/features/pickems/types/pickems.types";
import { useNow } from "@/features/schedule/hooks/useNow";
import type { Match } from "@/features/schedule/types/schedule.types";
import { DismissibleNotice } from "@/shared/components/DismissibleNotice";
import type { Team } from "@/shared/types/wcp.types";

import { useCompetitionName } from "../hooks/useCompetitionName";
import { competitionNeedsPick, getCompetitionPickState } from "../lib/competitionPickStatus";
import type { Competition, LeaderboardEntry } from "../types/competitions.types";

import { CompetitionCard } from "./CompetitionCard";
import { EmptyCompetitionsState } from "./EmptyCompetitionsState";

type Props = {
  boardId: number;
  currentUserId: string;
  currentUserInitials: string;
  competitions: Competition[];
  matches: Match[];
  teamsByCode: Map<string, Team>;
  topThreeByCompetition: Record<number, LeaderboardEntry[]>;
  pickemContext: { progress: PickemProgress | null; isLocked: boolean };
  awardsContext: { pickedTypes: AwardType[]; isLocked: boolean };
  query: string;
  canManage: boolean;
  canCreate: boolean;
  onCreate: () => void;
};

export function CompetitionsTab({
  boardId,
  currentUserId,
  currentUserInitials,
  competitions,
  matches,
  teamsByCode,
  topThreeByCompetition,
  pickemContext,
  awardsContext,
  query,
  canManage,
  canCreate,
  onCreate,
}: Props) {
  const t = useTranslations("competitions");
  const competitionName = useCompetitionName();
  const now = useNow();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return competitions;
    return competitions.filter((c) => competitionName(c.name).toLowerCase().includes(q));
  }, [competitions, query, competitionName]);

  const pendingCount = useMemo(
    () =>
      competitions.filter((c) =>
        competitionNeedsPick(getCompetitionPickState(c, matches, now, c.type === "pickem" ? pickemContext : undefined, c.type === "awards" ? awardsContext : undefined))
      ).length,
    [competitions, matches, now, pickemContext, awardsContext]
  );

  if (competitions.length === 0) {
    return <EmptyCompetitionsState canCreate={canCreate} onCreate={onCreate} />;
  }

  if (filtered.length === 0) {
    return <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">{t("leaderboard.noResults")}</p>;
  }

  return (
    <div className="flex flex-col gap-3.5">
      {pendingCount > 0 ? <PendingHint count={pendingCount} /> : null}
      <div className="grid auto-rows-fr grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((competition) => (
          <CompetitionCard
            key={competition.id}
            boardId={boardId}
            competition={competition}
            currentUserId={currentUserId}
            currentUserInitials={currentUserInitials}
            matches={matches}
            teamsByCode={teamsByCode}
            topThree={topThreeByCompetition[competition.id] ?? []}
            pickemContext={competition.type === "pickem" ? pickemContext : undefined}
            awardsContext={competition.type === "awards" ? awardsContext : undefined}
            canManage={canManage}
          />
        ))}
        {canCreate ? <AddCompetitionCard label={t("card.new")} hint={t("card.newHint")} onClick={onCreate} /> : null}
      </div>
    </div>
  );
}

// Explains the accent-bordered cards; dismissible (session-only) like the pick'em tips.
function PendingHint({ count }: { count: number }) {
  const t = useTranslations("competitions.card.hint");
  return (
    <DismissibleNotice tone="accent" dismissLabel={t("dismiss")} icon={<Flame className="mt-0.5 size-5 shrink-0 text-page-accent-strong" aria-hidden />}>
      <span className="flex flex-col gap-0.5">
        <span className="font-semibold text-foreground">{t("title", { count })}</span>
        <span className="text-muted-foreground">{t("description")}</span>
      </span>
    </DismissibleNotice>
  );
}

function AddCompetitionCard({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full min-h-30 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background p-4 text-center transition-colors hover:border-page-accent/40 hover:bg-page-accent-soft/40"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Plus className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}
