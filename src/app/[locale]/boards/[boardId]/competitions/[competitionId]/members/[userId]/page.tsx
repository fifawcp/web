import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { BOARDS_LIST_TAG } from "@/features/boards/api/boards";
import type { BoardListItem } from "@/features/boards/types/boards.types";
import { boardLeaderboardsTag, leaderboardTag } from "@/features/competitions/api/competitions";
import { memberPickemTag } from "@/features/competitions/api/memberPickem";
import { MemberPickemView } from "@/features/competitions/components/pickemReveal/MemberPickemView";
import type { LeaderboardEntry, LeaderboardMember, PickemScore } from "@/features/competitions/types/competitions.types";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";
import type { Match } from "@/features/schedule/types/schedule.types";
import { STANDINGS_CACHE_TAG } from "@/features/standings/api/standings";
import type { StandingRow } from "@/features/standings/types/standings.types";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

type Props = {
  params: Promise<{ boardId: string; competitionId: string; userId: string }>;
  // `n` (display name) + `u` (@handle) carried by the leaderboard link so the
  // header titles itself correctly even when the leaderboard lookup misses.
  searchParams: Promise<{ n?: string; u?: string }>;
};

export default async function MemberPickemPage({ params, searchParams }: Props) {
  const [{ boardId, competitionId, userId }, sp, user, locale] = await Promise.all([params, searchParams, getCurrentUser(), getLocale()]);
  if (!user) notFound();

  const boardIdNum = Number(boardId);
  const competitionIdNum = Number(competitionId);
  if (![boardIdNum, competitionIdNum].every(Number.isFinite)) notFound();

  const [boardsRes, leaderboardRes, pickemRes, standingsRes, matchesRes] = await Promise.all([
    serverApi.get<BoardListItem[]>("/api/boards", { authenticated: true, next: { revalidate: 30, tags: [BOARDS_LIST_TAG] } }),
    // limit=100 covers a typical board in one page, giving the member's identity,
    // rank and points; the query-param fallback below covers anyone past it.
    serverApi.get<LeaderboardEntry[]>(`/api/boards/${boardIdNum}/competitions/${competitionIdNum}/leaderboard?limit=100`, {
      authenticated: true,
      next: { revalidate: 30, tags: [leaderboardTag(boardIdNum, competitionIdNum), boardLeaderboardsTag(boardIdNum)] },
    }),
    serverApi.get<UserPickem>(`/api/boards/${boardIdNum}/members/${userId}/pickem`, {
      authenticated: true,
      next: { revalidate: 60, tags: [memberPickemTag(boardIdNum, userId)] },
    }),
    // Actual results the member's predictions are scored against.
    serverApi.get<StandingRow[]>("/api/standings", { authenticated: false, next: { revalidate: 60, tags: [STANDINGS_CACHE_TAG] } }),
    serverApi.get<Match[]>("/api/matches", { authenticated: true, next: { revalidate: 60, tags: [MATCHES_CACHE_TAG] } }),
  ]);

  if (!boardsRes.success) throw new Error(boardsRes.error?.message ?? "Failed to load boards");
  const boards = boardsRes.data ?? [];

  // Mirror the competition page's self-healing: missing board or non-member bounces to a fallback.
  const isMember = boards.some((b) => b.id === boardIdNum);
  if (!isMember) {
    const fallback = boards.find((b) => b.privacy === "global") ?? boards[0];
    if (fallback) redirect({ href: `/boards/${fallback.id}?notice=board-not-found`, locale });
    notFound();
  }

  const entry = leaderboardRes.success ? (leaderboardRes.data ?? []).find((e) => e.member.user_id === userId) : undefined;
  const member: LeaderboardMember = entry?.member ?? buildMemberFromQuery(userId, sp);

  // The endpoint only reveals a member's pick'em after the tournament locks (it
  // 403s before). Rather than bouncing — which reads as a broken navigation — we
  // render the view and let it show a "not revealed yet" state.
  const pickem = pickemRes.success ? (pickemRes.data ?? null) : null;

  return (
    <MemberPickemView
      boardId={boardIdNum}
      competitionId={competitionIdNum}
      member={member}
      rank={entry?.rank ?? null}
      score={entry ? (entry.score as PickemScore) : null}
      pickem={pickem}
      standings={standingsRes.success ? (standingsRes.data ?? []) : []}
      matches={matchesRes.success ? (matchesRes.data ?? []) : []}
    />
  );
}

// Roster-shaped member from the link's display name + handle, so the header reads
// correctly without a leaderboard hit. The name is split into first/last so
// `displayName`/`getInitials` reproduce it; falls back to a bare handle.
function buildMemberFromQuery(userId: string, sp: { n?: string; u?: string }): LeaderboardMember {
  const name = sp.n?.trim();
  const username = sp.u?.trim() ?? "";
  if (!name) return { user_id: userId, username, first_name: null, last_name: null };
  const parts = name.split(/\s+/);
  return {
    user_id: userId,
    username,
    first_name: parts[0] || null,
    last_name: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}
