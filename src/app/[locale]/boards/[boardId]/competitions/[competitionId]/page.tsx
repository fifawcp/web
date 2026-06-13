import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { BOARDS_LIST_TAG, boardTag } from "@/features/boards/api/boards";
import type { Board, BoardListItem } from "@/features/boards/types/boards.types";
import { competitionsTag } from "@/features/competitions/api/competitions";
import { CompetitionDetailSkeleton } from "@/features/competitions/components/CompetitionDetailSkeleton";
import { normalizeCompetition } from "@/features/competitions/lib/normalizeCompetition";
import { resolvePickMatch } from "@/features/competitions/lib/resolvePickMatch";
import type { Competition } from "@/features/competitions/types/competitions.types";
import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";
import { computeMatchUiState } from "@/features/schedule/lib/computeMatchUiState";
import type { Match } from "@/features/schedule/types/schedule.types";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

import { CompetitionDetailContent } from "./CompetitionDetailContent";

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

  // Guard reads (cached, fast): enough to resolve the board + competition type, so the
  // Suspense fallback below can pick the matching skeleton before the heavy reads run.
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
  const matches = matchesRes.data ?? [];
  const competitions = (competitionsRes.data ?? []).map(normalizeCompetition);
  const competition = competitions.find((c) => c.id === competitionIdNum);
  // Unknown/deleted competition — fall back to the board grid with a one-shot notice.
  if (!competition) {
    redirect({ href: `/boards/${boardIdNum}?notice=competition-not-found`, locale });
    notFound();
  }

  // Single-match pick: nothing to show before kickoff (the leaderboard is all zeros and
  // picks stay hidden), so bounce back to the board. Once locked, seed its match id.
  let pickMatchId: number | null = null;
  if (competition.type === "pick") {
    const pickMatch = resolvePickMatch(competition, matches);
    if (!pickMatch || !computeMatchUiState(pickMatch).isLocked) {
      redirect({ href: `/boards/${boardIdNum}?tab=competitions`, locale });
    } else {
      pickMatchId = pickMatch.id;
    }
  }

  const pageNum = Math.max(1, Number(page ?? "1") || 1);
  const query = (q ?? "").trim();

  return (
    <Suspense fallback={<CompetitionDetailSkeleton type={competition.type} />}>
      <CompetitionDetailContent
        currentUserId={user.id}
        board={activeBoard}
        competition={competition}
        matches={matches}
        pickMatchId={pickMatchId}
        page={pageNum}
        query={query}
      />
    </Suspense>
  );
}
