import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { BOARDS_LIST_TAG, boardTag } from "@/features/boards/api/boards";
import type { Board, BoardListItem } from "@/features/boards/types/boards.types";
import { boardLeaderboardsTag, competitionsTag, LEADERBOARD_PAGE_SIZE, leaderboardTag } from "@/features/competitions/api/competitions";
import { CompetitionDetailView } from "@/features/competitions/components/CompetitionDetailView";
import type { Competition, LeaderboardEntry, LeaderboardPage } from "@/features/competitions/types/competitions.types";
import { PICKEMS_CACHE_TAG } from "@/features/pickems/api/pickems";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";
import type { Match } from "@/features/schedule/types/schedule.types";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

type Props = {
  params: Promise<{ boardId: string; competitionId: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function CompetitionDetailPage({ params, searchParams }: Props) {
  const [{ boardId, competitionId }, { page, q }] = await Promise.all([params, searchParams]);
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  if (!user) notFound();

  const boardIdNum = Number(boardId);
  const competitionIdNum = Number(competitionId);
  if (!Number.isFinite(boardIdNum) || !Number.isFinite(competitionIdNum)) notFound();

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

  // Mirror the board page's self-healing: missing board or non-member bounces to a fallback board.
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
  const competition = competitions.find((c) => c.id === competitionIdNum);
  // Unknown/deleted competition — fall back to the board grid with a one-shot notice.
  if (!competition) {
    redirect({ href: `/boards/${boardIdNum}?notice=competition-not-found`, locale });
    notFound();
  }

  const pageNum = Math.max(1, Number(page ?? "1") || 1);
  const query = (q ?? "").trim();

  const lbSearch = new URLSearchParams({ page: String(pageNum), limit: String(LEADERBOARD_PAGE_SIZE) });
  if (query) lbSearch.set("q", query);
  const lbRes = await serverApi.get<LeaderboardEntry[]>(`/api/boards/${boardIdNum}/competitions/${competitionIdNum}/leaderboard?${lbSearch.toString()}`, {
    authenticated: true,
    next: { revalidate: 30, tags: [leaderboardTag(boardIdNum, competitionIdNum), boardLeaderboardsTag(boardIdNum)] },
  });

  let initialLeaderboard: LeaderboardPage | null = null;
  if (lbRes.success && lbRes.data) {
    const items = lbRes.data;
    const fallback = { page: pageNum, limit: LEADERBOARD_PAGE_SIZE, total: items.length, has_more: false };
    const pagination = lbRes.pagination ?? fallback;
    initialLeaderboard = { items, page: pagination.page, limit: pagination.limit, total: pagination.total, has_more: pagination.has_more };
  }

  // Pick'em lock state seeds the header countdown + CTA, mirroring the board grid.
  let pickem: { progress: UserPickem["progress"]; isLocked: boolean } | null = null;
  if (competition.type === "pickem") {
    const pickemRes = await serverApi.get<UserPickem>("/api/pickems", { authenticated: true, next: { revalidate: 30, tags: [PICKEMS_CACHE_TAG] } });
    if (pickemRes.success && pickemRes.data) pickem = { progress: pickemRes.data.progress, isLocked: pickemRes.data.is_locked };
  }

  return (
    <CompetitionDetailView
      currentUserId={user.id}
      board={activeBoard}
      competition={competition}
      matches={matchesRes.data ?? []}
      pickem={pickem}
      initialLeaderboard={initialLeaderboard}
    />
  );
}
