"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { CompetitionInfoCard } from "@/features/competitions/components/CompetitionInfoCard";
import { CreateCompetitionWizard } from "@/features/competitions/components/CreateCompetitionWizard";
import { EmptyCompetitionsState } from "@/features/competitions/components/EmptyCompetitionsState";
import { LeaderboardSection } from "@/features/competitions/components/LeaderboardSection";
import { Podium } from "@/features/competitions/components/Podium";
import { COMPETITION_PARAM } from "@/features/competitions/hooks/useCompetitionUrlState";
import type { Competition, LeaderboardPage } from "@/features/competitions/types/competitions.types";
import type { Team } from "@/shared/types/wcp.types";

import { canCreateCompetitions } from "../lib/boardRole";
import { rememberLastBoard } from "../lib/lastBoardCookie";
import type { Board, BoardListItem } from "../types/boards.types";

import { BoardHeader } from "./BoardHeader";

type Props = {
  currentUserId: string;
  boards: BoardListItem[];
  activeBoard: Board;
  competitions: Competition[];
  activeCompetition: Competition | null;
  initialLeaderboard: LeaderboardPage | null;
  teams: Team[];
  boardNotFound?: boolean;
  competitionNotFound?: boolean;
};

export function BoardHomeView({
  currentUserId,
  boards,
  activeBoard,
  competitions,
  activeCompetition,
  initialLeaderboard,
  teams,
  boardNotFound = false,
  competitionNotFound = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tBoards = useTranslations("boards");
  const tComp = useTranslations("competitions");
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    rememberLastBoard(activeBoard.id);
    // Land at the top when arriving on a board (e.g. the footer's "Global board"
    // link), not wherever the previous page was scrolled to.
    window.scrollTo({ top: 0 });
  }, [activeBoard.id]);

  // URL normalization: keep ?competition= pointed at the active competition and drop the
  // one-shot ?notice= (set when we bounce here from a missing board) — both in one replace
  // so they don't race each other.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;
    if (activeCompetition && Number(next.get(COMPETITION_PARAM)) !== activeCompetition.id) {
      next.set(COMPETITION_PARAM, String(activeCompetition.id));
      changed = true;
    }
    if (next.has("notice")) {
      next.delete("notice");
      changed = true;
    }
    if (!changed) return;
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [activeCompetition, pathname, router, searchParams]);

  // Tell the user why they landed somewhere other than the URL they followed. Ref-guarded so the
  // URL cleanup above (or a refresh) doesn't replay the toast.
  const noticeShown = useRef(false);
  useEffect(() => {
    if (noticeShown.current || (!boardNotFound && !competitionNotFound)) return;
    noticeShown.current = true;
    toast.error(boardNotFound ? tBoards("notFound") : tComp("notFound"));
  }, [boardNotFound, competitionNotFound, tBoards, tComp]);

  const teamsByCode = useMemo(() => new Map(teams.map((team) => [team.fifa_code, team])), [teams]);
  const canCreate = canCreateCompetitions(activeBoard);

  function selectCompetition(id: number) {
    const next = new URLSearchParams(searchParams);
    next.set(COMPETITION_PARAM, String(id));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <>
      <section className="container pt-6 pb-8 lg:pt-8">
        {activeCompetition ? (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <div className="flex w-full flex-col gap-4 lg:sticky lg:top-(--boards-rail-offset) lg:w-100 lg:shrink-0 lg:self-start">
              <BoardHeader boards={boards} activeBoard={activeBoard} currentUserId={currentUserId} />
              <CompetitionInfoCard
                boardId={activeBoard.id}
                competition={activeCompetition}
                competitions={competitions}
                teamsByCode={teamsByCode}
                canCreate={canCreate}
                onSelect={selectCompetition}
                onCreate={() => setWizardOpen(true)}
              />
              <Podium entries={initialLeaderboard?.items ?? []} />
            </div>
            <div className="min-w-0 flex-1">
              <LeaderboardSection
                key={activeCompetition.id}
                boardId={activeBoard.id}
                competition={activeCompetition}
                currentUserId={currentUserId}
                initialData={initialLeaderboard}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <BoardHeader boards={boards} activeBoard={activeBoard} currentUserId={currentUserId} />
            <EmptyCompetitionsState canCreate={canCreate} onCreate={() => setWizardOpen(true)} />
          </div>
        )}
      </section>

      {canCreate ? <CreateCompetitionWizard open={wizardOpen} onOpenChange={setWizardOpen} boardId={activeBoard.id} teams={teams} /> : null}
    </>
  );
}
