import { AWARDS_CACHE_TAG } from "@/features/awards/api/awards";
import type { UserAwards } from "@/features/awards/types/awards.types";
import type { Board } from "@/features/boards/types/boards.types";
import { boardLeaderboardsTag, LEADERBOARD_PAGE_SIZE, leaderboardTag } from "@/features/competitions/api/competitions";
import { boardMatchPicksTag } from "@/features/competitions/api/predictions";
import { CompetitionDetailView } from "@/features/competitions/components/CompetitionDetailView";
import type { Competition, LeaderboardEntry, LeaderboardPage } from "@/features/competitions/types/competitions.types";
import type { BoardMatchPicks } from "@/features/competitions/types/predictions.types";
import { PICKEMS_CACHE_TAG } from "@/features/pickems/api/pickems";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import type { Match } from "@/features/schedule/types/schedule.types";
import { serverApi } from "@/shared/lib/api/server";

type Props = {
  currentUserId: string;
  board: Board;
  competition: Competition;
  matches: Match[];
  // The pick competition's locked match id (resolved by the page), or null.
  pickMatchId: number | null;
  page: number;
  query: string;
};

// The type-specific data layer, rendered behind a Suspense boundary so each
// competition type shows its matching skeleton while these reads resolve.
export async function CompetitionDetailContent({ currentUserId, board, competition, matches, pickMatchId, page, query }: Props) {
  // A pick competition's breakdown carries its own ranked table, so the leaderboard fetch is skipped.
  let initialLeaderboard: LeaderboardPage | null = null;
  if (competition.type !== "pick") {
    const lbSearch = new URLSearchParams({ page: String(page), limit: String(LEADERBOARD_PAGE_SIZE) });
    if (query) lbSearch.set("q", query);
    const lbRes = await serverApi.get<LeaderboardEntry[]>(`/api/boards/${board.id}/competitions/${competition.id}/leaderboard?${lbSearch.toString()}`, {
      authenticated: true,
      next: { revalidate: 30, tags: [leaderboardTag(board.id, competition.id), boardLeaderboardsTag(board.id)] },
    });
    if (lbRes.success && lbRes.data) {
      const items = lbRes.data;
      const fallback = { page, limit: LEADERBOARD_PAGE_SIZE, total: items.length, has_more: false };
      const pagination = lbRes.pagination ?? fallback;
      initialLeaderboard = { items, page: pagination.page, limit: pagination.limit, total: pagination.total, has_more: pagination.has_more };
    }
  }

  // Pick'em / awards lock state seeds the header countdown + CTA, mirroring the board grid.
  let pickem: { progress: UserPickem["progress"]; isLocked: boolean } | null = null;
  if (competition.type === "pickem") {
    const pickemRes = await serverApi.get<UserPickem>("/api/pickems", { authenticated: true, next: { revalidate: 30, tags: [PICKEMS_CACHE_TAG] } });
    if (pickemRes.success && pickemRes.data) pickem = { progress: pickemRes.data.progress, isLocked: pickemRes.data.is_locked };
  }

  let awards: { pickedTypes: UserAwards["picks"][number]["award_type"][]; isLocked: boolean } | null = null;
  if (competition.type === "awards") {
    const awardsRes = await serverApi.get<UserAwards>("/api/awards", { authenticated: true, next: { revalidate: 30, tags: [AWARDS_CACHE_TAG] } });
    if (awardsRes.success && awardsRes.data) {
      awards = { pickedTypes: awardsRes.data.picks.filter((p) => p.player != null).map((p) => p.award_type), isLocked: awardsRes.data.is_locked };
    }
  }

  // Seed the in-page board breakdown for a locked pick competition.
  let breakdownInitial: BoardMatchPicks | null = null;
  if (competition.type === "pick" && pickMatchId != null) {
    const picksRes = await serverApi.get<BoardMatchPicks>(`/api/boards/${board.id}/matches/${pickMatchId}/picks`, {
      authenticated: true,
      next: { revalidate: 30, tags: [boardMatchPicksTag(board.id, pickMatchId)] },
    });
    if (picksRes.success && picksRes.data) breakdownInitial = picksRes.data;
  }

  return (
    <CompetitionDetailView
      currentUserId={currentUserId}
      board={board}
      competition={competition}
      matches={matches}
      pickem={pickem}
      awards={awards}
      initialLeaderboard={initialLeaderboard}
      breakdownInitial={breakdownInitial}
    />
  );
}
