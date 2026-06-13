"use client";

import { useState } from "react";
import { ListOrdered, Lock, MoreVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AwardType } from "@/features/awards/types/awards.types";
import type { PickemProgress } from "@/features/pickems/types/pickems.types";
import { useNow } from "@/features/schedule/hooks/useNow";
import { computeMatchUiState } from "@/features/schedule/lib/computeMatchUiState";
import type { Match } from "@/features/schedule/types/schedule.types";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

import { useCompetitionName } from "../hooks/useCompetitionName";
import { competitionDeepLink } from "../lib/competitionDeepLink";
import { competitionNeedsPick, getCompetitionPickState } from "../lib/competitionPickStatus";
import { competitionTypeMeta } from "../lib/competitionTypeMeta";
import { resolvePickMatch } from "../lib/resolvePickMatch";
import type { Competition, LeaderboardEntry } from "../types/competitions.types";

import { CompetitionCardContext } from "./CompetitionCardContext";
import { CompetitionMiniLeaderboard } from "./CompetitionMiniLeaderboard";
import { DeleteCompetitionDialog } from "./DeleteCompetitionDialog";
import { PicksCta } from "./PicksCta";

type PickemContext = { progress: PickemProgress | null; isLocked: boolean };
type AwardsContext = { pickedTypes: AwardType[]; isLocked: boolean };

type Props = {
  boardId: number;
  competition: Competition;
  currentUserId: string;
  currentUserInitials: string;
  matches: Match[];
  teamsByCode: Map<string, Team>;
  topThree: LeaderboardEntry[];
  pickemContext?: PickemContext;
  awardsContext?: AwardsContext;
  canManage: boolean;
};

export function CompetitionCard({
  boardId,
  competition,
  currentUserId,
  currentUserInitials,
  matches,
  teamsByCode,
  topThree,
  pickemContext,
  awardsContext,
  canManage,
}: Props) {
  const t = useTranslations("competitions.card");
  const tRoot = useTranslations("competitions");
  const competitionName = useCompetitionName();
  const now = useNow();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const meta = competitionTypeMeta(competition.type);
  const Icon = meta.icon;
  const pickState = getCompetitionPickState(competition, matches, now, pickemContext, awardsContext);
  const needsPick = competitionNeedsPick(pickState);
  const deletable = canManage;
  const picksHref = competitionDeepLink(competition, pickState);

  // A single-match pick whose match hasn't kicked off — its leaderboard is hidden
  // (all zeros), so the preview + the leaderboard link are gated until it locks.
  const pickMatch = competition.type === "pick" ? resolvePickMatch(competition, matches) : null;
  const pickPending = competition.type === "pick" && !(pickMatch && computeMatchUiState(pickMatch, now).isLocked);
  // Pick competition whose match has locked: the breakdown is the whole story, so the
  // footer collapses to a single "See results" link instead of leaderboard + view picks.
  const pickResultsOut = competition.type === "pick" && !pickPending;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col gap-3 overflow-hidden rounded-xl border bg-card p-4 shadow-xs transition-colors",
        needsPick ? "border-page-accent/40" : "border-foreground/10"
      )}
    >
      {needsPick ? <span className="absolute inset-y-0 left-0 w-1 bg-page-accent" aria-hidden /> : null}

      <div className="flex items-start gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", meta.tileClass)}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{tRoot(`type.${meta.labelKey}`)}</span>
          <h3 className="truncate font-heading text-base font-semibold">{competitionName(competition.name)}</h3>
        </div>
        {deletable ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="shrink-0" aria-label={t("actions")}>
                <MoreVertical className="size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)} className="cursor-pointer whitespace-nowrap">
                <Trash2 className="size-4" aria-hidden />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <CompetitionCardContext
        competition={competition}
        matches={matches}
        teamsByCode={teamsByCode}
        pickState={pickState}
        pickemProgress={pickemContext?.progress ?? null}
        awardsPickedTypes={awardsContext?.pickedTypes ?? []}
        now={now}
      />

      {pickPending ? (
        <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg bg-muted px-4 py-3 text-center">
          <span className="grid size-9 place-items-center rounded-full bg-background text-muted-foreground">
            <Lock className="size-4" aria-hidden />
          </span>
          <p className="text-sm font-semibold text-foreground">{tRoot("breakdown.locked.title")}</p>
          <p className="text-xs leading-snug text-muted-foreground">{tRoot("breakdown.locked.description")}</p>
        </div>
      ) : (
        <CompetitionMiniLeaderboard entries={topThree} currentUserId={currentUserId} currentUserInitials={currentUserInitials} viewer={competition.viewer} />
      )}

      {pickResultsOut ? (
        <Button asChild variant="outline" size="sm" className="mt-auto w-full gap-1.5">
          <Link href={`/boards/${boardId}/competitions/${competition.id}`}>
            <ListOrdered className="size-4" aria-hidden />
            {t("seeResults")}
          </Link>
        </Button>
      ) : (
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {pickPending ? (
            <Button variant="ghost" size="sm" className="gap-1.5" disabled>
              <ListOrdered className="size-4" aria-hidden />
              {t("leaderboard")}
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href={`/boards/${boardId}/competitions/${competition.id}`}>
                <ListOrdered className="size-4" aria-hidden />
                {t("leaderboard")}
              </Link>
            </Button>
          )}
          <PicksCta href={picksHref} state={pickState.kind} />
        </div>
      )}

      {deletable ? <DeleteCompetitionDialog boardId={boardId} competition={competition} open={deleteOpen} onOpenChange={setDeleteOpen} /> : null}
    </div>
  );
}
