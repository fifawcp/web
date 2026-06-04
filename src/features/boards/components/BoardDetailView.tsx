"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { CompetitionsTab } from "@/features/competitions/components/CompetitionsTab";
import { CreateCompetitionWizard } from "@/features/competitions/components/CreateCompetitionWizard";
import type { Competition, LeaderboardEntry } from "@/features/competitions/types/competitions.types";
import type { PickemProgress } from "@/features/pickems/types/pickems.types";
import type { Match } from "@/features/schedule/types/schedule.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { Team } from "@/shared/types/wcp.types";

import { canCreateCompetitions, canManageBoard } from "../lib/boardRole";
import { rememberLastBoard } from "../lib/lastBoardCookie";
import type { Board, BoardListItem } from "../types/boards.types";

import { BoardHeader } from "./BoardHeader";
import { BoardTabs, type BoardTabKey } from "./BoardTabs";
import { MembersTab } from "./MembersTab";

type Props = {
  currentUserId: string;
  currentUserInitials: string;
  boards: BoardListItem[];
  activeBoard: Board;
  competitions: Competition[];
  teams: Team[];
  matches: Match[];
  topThreeByCompetition: Record<number, LeaderboardEntry[]>;
  pickem: { progress: PickemProgress | null; isLocked: boolean } | null;
  boardNotFound?: boolean;
  competitionNotFound?: boolean;
};

const TAB_PARAM = "tab";

export function BoardDetailView({
  currentUserId,
  currentUserInitials,
  boards,
  activeBoard,
  competitions,
  teams,
  matches,
  topThreeByCompetition,
  pickem,
  boardNotFound = false,
  competitionNotFound = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tBoards = useTranslations("boards");
  const tComp = useTranslations("competitions");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [query, setQuery] = useState("");

  const tab: BoardTabKey = searchParams.get(TAB_PARAM) === "members" ? "members" : "competitions";

  useEffect(() => {
    rememberLastBoard(activeBoard.id);
    window.scrollTo({ top: 0 });
  }, [activeBoard.id]);

  // Drop the one-shot ?notice= once we've consumed it for the toast below.
  useEffect(() => {
    if (!searchParams.has("notice")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("notice");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const noticeShown = useRef(false);
  useEffect(() => {
    if (noticeShown.current || (!boardNotFound && !competitionNotFound)) return;
    noticeShown.current = true;
    toast.error(boardNotFound ? tBoards("notFound") : tComp("notFound"));
  }, [boardNotFound, competitionNotFound, tBoards, tComp]);

  const teamsByCode = useMemo(() => new Map(teams.map((team) => [team.fifa_code, team])), [teams]);
  const canCreate = canCreateCompetitions(activeBoard);
  const canManage = canManageBoard(activeBoard.viewer.role);

  const pickemContext = useMemo(() => ({ progress: pickem?.progress ?? null, isLocked: pickem?.isLocked ?? false }), [pickem]);

  function setTab(next: BoardTabKey) {
    const params = new URLSearchParams(searchParams);
    if (next === "competitions") params.delete(TAB_PARAM);
    else params.set(TAB_PARAM, next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const tabs = [
    { key: "competitions" as const, label: tBoards("tabs.competitions") },
    { key: "members" as const, label: tBoards("tabs.members") },
  ];

  const toolbar =
    tab === "competitions" ? (
      <>
        <div className="relative flex-1 sm:w-56 sm:flex-none">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tComp("card.filter")} className="h-9 pl-9" />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={tComp("card.clearFilter")}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
        {canCreate ? (
          <Button size="sm" className="gap-1.5 bg-page-accent text-white hover:bg-page-accent/90" onClick={() => setWizardOpen(true)}>
            <Plus className="size-4" aria-hidden />
            <span className="max-sm:hidden">{tComp("card.new")}</span>
            <span className="sm:hidden">{tComp("card.newShort")}</span>
          </Button>
        ) : null}
      </>
    ) : null;

  return (
    <>
      <section className="container flex flex-col gap-5 pt-6 pb-8 lg:pt-8">
        <BoardHeader boards={boards} activeBoard={activeBoard} />

        <BoardTabs value={tab} onValueChange={setTab} tabs={tabs} right={toolbar} />

        {tab === "competitions" ? (
          <CompetitionsTab
            boardId={activeBoard.id}
            currentUserId={currentUserId}
            currentUserInitials={currentUserInitials}
            competitions={competitions}
            matches={matches}
            teamsByCode={teamsByCode}
            topThreeByCompetition={topThreeByCompetition}
            pickemContext={pickemContext}
            query={query}
            canManage={canManage}
            canCreate={canCreate}
            onCreate={() => setWizardOpen(true)}
          />
        ) : (
          <MembersTab board={activeBoard} currentUserId={currentUserId} enabled={tab === "members"} />
        )}
      </section>

      {canCreate ? <CreateCompetitionWizard open={wizardOpen} onOpenChange={setWizardOpen} boardId={activeBoard.id} teams={teams} matches={matches} /> : null}
    </>
  );
}
