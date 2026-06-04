import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { BOARDS_LIST_TAG, boardTag } from "@/features/boards/api/boards";
import { BoardDetailView } from "@/features/boards/components/BoardDetailView";
import type { Board, BoardListItem } from "@/features/boards/types/boards.types";
import { competitionsTag, leaderboardTag } from "@/features/competitions/api/competitions";
import type { Competition, LeaderboardEntry } from "@/features/competitions/types/competitions.types";
import { PICKEMS_CACHE_TAG } from "@/features/pickems/api/pickems";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";
import { collectTeams } from "@/features/schedule/lib/collectTeams";
import type { Match } from "@/features/schedule/types/schedule.types";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";
import { getInitials } from "@/shared/lib/ui";

type Props = {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ competition?: string; notice?: string }>;
};

// Top of the leaderboard previewed on each competition card. Small + concurrent + cache-tagged so
// the pick→revalidate flow already keeps them fresh.
const TOP_PREVIEW_LIMIT = 3;

export default async function BoardPage({ params, searchParams }: Props) {
  const [{ boardId }, { competition, notice }] = await Promise.all([params, searchParams]);
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  if (!user) notFound();

  const boardIdNum = Number(boardId);
  if (!Number.isFinite(boardIdNum)) notFound();

  // Backward-compat: old links pointed the leaderboard at ?competition=<id>; that view is now a
  // dedicated route.
  const competitionParam = Number(competition);
  if (Number.isFinite(competitionParam) && competition) {
    redirect({ href: `/boards/${boardIdNum}/competitions/${competitionParam}`, locale });
  }

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
  const matches = matchesRes.data ?? [];

  // Prefetch the top-N for every competition (concurrently) + the tournament pick'em progress (when
  // the board has a pick'em — always, since it's the auto-seeded anchor).
  const hasPickem = competitions.some((c) => c.type === "pickem");
  const [topPreviews, pickemRes] = await Promise.all([
    Promise.all(
      competitions.map((c) =>
        serverApi.get<LeaderboardEntry[]>(`/api/boards/${boardIdNum}/competitions/${c.id}/leaderboard?page=1&limit=${TOP_PREVIEW_LIMIT}`, {
          authenticated: true,
          next: { revalidate: 30, tags: [leaderboardTag(boardIdNum, c.id)] },
        })
      )
    ),
    hasPickem ? serverApi.get<UserPickem>("/api/pickems", { authenticated: true, next: { revalidate: 30, tags: [PICKEMS_CACHE_TAG] } }) : Promise.resolve(null),
  ]);

  const topThreeByCompetition: Record<number, LeaderboardEntry[]> = {};
  competitions.forEach((c, i) => {
    const res = topPreviews[i];
    topThreeByCompetition[c.id] = res?.success && res.data ? res.data : [];
  });

  const pickem = pickemRes?.success && pickemRes.data ? { progress: pickemRes.data.progress, isLocked: pickemRes.data.is_locked } : null;

  return (
    <BoardDetailView
      currentUserId={user.id}
      currentUserInitials={getInitials(user.username, user.first_name, user.last_name)}
      boards={boards}
      activeBoard={activeBoard}
      competitions={competitions}
      teams={teams}
      matches={matches}
      topThreeByCompetition={topThreeByCompetition}
      pickem={pickem}
      boardNotFound={notice === "board-not-found"}
      competitionNotFound={notice === "competition-not-found"}
    />
  );
}
