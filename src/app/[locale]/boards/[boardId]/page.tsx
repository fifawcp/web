import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { BOARDS_LIST_TAG, boardTag } from "@/features/boards/api/boards";
import { BoardHomeView } from "@/features/boards/components/BoardHomeView";
import type { Board, BoardListItem } from "@/features/boards/types/boards.types";
import { competitionsTag, LEADERBOARD_PAGE_SIZE, leaderboardTag } from "@/features/competitions/api/competitions";
import type { Competition, LeaderboardEntry, LeaderboardPage } from "@/features/competitions/types/competitions.types";
import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";
import { collectTeams } from "@/features/schedule/lib/collectTeams";
import type { Match } from "@/features/schedule/types/schedule.types";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

type Props = {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ competition?: string; notice?: string }>;
};

export default async function BoardPage({ params, searchParams }: Props) {
  const [{ boardId }, { competition, notice }] = await Promise.all([params, searchParams]);
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  if (!user) notFound();

  const boardIdNum = Number(boardId);
  if (!Number.isFinite(boardIdNum)) notFound();

  const [boardsRes, boardRes, competitionsRes, matchesRes] = await Promise.all([
    serverApi.get<BoardListItem[]>("/api/boards", {
      authenticated: true,
      next: { revalidate: 30, tags: [BOARDS_LIST_TAG] },
    }),
    serverApi.get<Board>(`/api/boards/${boardIdNum}`, {
      authenticated: true,
      next: { revalidate: 30, tags: [boardTag(boardIdNum)] },
    }),
    serverApi.get<Competition[]>(`/api/boards/${boardIdNum}/competitions`, {
      authenticated: true,
      next: { revalidate: 30, tags: [competitionsTag(boardIdNum)] },
    }),
    serverApi.get<Match[]>("/api/matches", {
      authenticated: true,
      next: { revalidate: 300, tags: [MATCHES_CACHE_TAG] },
    }),
  ]);

  if (!boardsRes.success) throw new Error(boardsRes.error?.message ?? "Failed to load boards");
  const boards = boardsRes.data ?? [];

  // Board missing, or the viewer isn't a member (removed from the board, or a stale/typo'd link):
  // bounce to the global board (or the first available) with a one-shot notice instead of a 404.
  const isMember = boards.some((b) => b.id === boardIdNum);
  if (!boardRes.success || !boardRes.data || !isMember) {
    const fallback = boards.find((b) => b.privacy === "global") ?? boards[0];
    if (fallback) redirect({ href: `/boards/${fallback.id}?notice=board-not-found`, locale });
    notFound();
  }

  if (!competitionsRes.success) throw new Error(competitionsRes.error?.message ?? "Failed to load competitions");
  if (!matchesRes.success) throw new Error(matchesRes.error?.message ?? "Failed to load matches");

  const activeBoard = boardRes.data;
  const competitions = competitionsRes.data ?? [];
  const teams = collectTeams(matchesRes.data ?? []);
  const competitionParam = Number(competition);
  const matchedCompetition = Number.isFinite(competitionParam) ? competitions.find((c) => c.id === competitionParam) : undefined;
  const activeCompetition = matchedCompetition ?? competitions[0] ?? null;
  // A `?competition=` was given but matches nothing real — the view falls back to the first
  // competition and self-heals the URL; flag it so the client can explain the switch.
  const competitionNotFound = Boolean(competition) && !matchedCompetition && competitions.length > 0;

  let initialLeaderboard: LeaderboardPage | null = null;
  if (activeCompetition) {
    const lbRes = await serverApi.get<LeaderboardEntry[]>(
      `/api/boards/${boardIdNum}/competitions/${activeCompetition.id}/leaderboard?page=1&limit=${LEADERBOARD_PAGE_SIZE}`,
      {
        authenticated: true,
        next: { revalidate: 30, tags: [leaderboardTag(boardIdNum, activeCompetition.id)] },
      }
    );
    if (lbRes.success && lbRes.data) {
      const items = lbRes.data;
      const fallback = { page: 1, limit: LEADERBOARD_PAGE_SIZE, total: items.length, has_more: false };
      const pagination = lbRes.pagination ?? fallback;
      initialLeaderboard = { items, page: pagination.page, limit: pagination.limit, total: pagination.total, has_more: pagination.has_more };
    }
  }

  return (
    <BoardHomeView
      currentUserId={user.id}
      boards={boards}
      activeBoard={activeBoard}
      competitions={competitions}
      activeCompetition={activeCompetition}
      initialLeaderboard={initialLeaderboard}
      teams={teams}
      boardNotFound={notice === "board-not-found"}
      competitionNotFound={competitionNotFound}
    />
  );
}
