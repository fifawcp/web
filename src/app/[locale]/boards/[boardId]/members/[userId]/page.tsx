import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import type { UserAwards } from "@/features/awards/types/awards.types";
import { BOARDS_LIST_TAG, boardMembersTag } from "@/features/boards/api/boards";
import { memberAwardsTag, memberPickemTag } from "@/features/boards/api/memberPicks";
import { MemberPicksView } from "@/features/boards/components/MemberPicksView";
import type { BoardListItem, BoardMember } from "@/features/boards/types/boards.types";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";
import type { Match } from "@/features/schedule/types/schedule.types";
import { STANDINGS_CACHE_TAG } from "@/features/standings/api/standings";
import type { StandingRow } from "@/features/standings/types/standings.types";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

type Props = {
  params: Promise<{ boardId: string; userId: string }>;
  // `n` (display name) + `u` (@handle) carried by the leaderboard link so the
  // header titles itself correctly even when the roster lookup misses.
  searchParams: Promise<{ n?: string; u?: string }>;
};

export default async function BoardMemberPage({ params, searchParams }: Props) {
  const [{ boardId, userId }, sp, user, locale] = await Promise.all([params, searchParams, getCurrentUser(), getLocale()]);
  if (!user) notFound();

  const boardIdNum = Number(boardId);
  if (!Number.isFinite(boardIdNum)) notFound();

  // Viewing your own picks here is redundant — send you to the editable surface.
  if (userId === user.id) redirect({ href: "/pickems", locale });

  const [boardsRes, membersRes, pickemRes, awardsRes, standingsRes, matchesRes] = await Promise.all([
    serverApi.get<BoardListItem[]>("/api/boards", { authenticated: true, next: { revalidate: 30, tags: [BOARDS_LIST_TAG] } }),
    serverApi.get<BoardMember[]>(`/api/boards/${boardIdNum}/members?limit=100`, { authenticated: true, next: { revalidate: 30, tags: [boardMembersTag(boardIdNum)] } }),
    serverApi.get<UserPickem>(`/api/boards/${boardIdNum}/members/${userId}/pickem`, {
      authenticated: true,
      next: { revalidate: 60, tags: [memberPickemTag(boardIdNum, userId)] },
    }),
    serverApi.get<UserAwards>(`/api/boards/${boardIdNum}/members/${userId}/awards`, {
      authenticated: true,
      next: { revalidate: 60, tags: [memberAwardsTag(boardIdNum, userId)] },
    }),
    // Actual results the member's predictions are scored against (compare mode).
    serverApi.get<StandingRow[]>("/api/standings", { authenticated: false, next: { revalidate: 60, tags: [STANDINGS_CACHE_TAG] } }),
    serverApi.get<Match[]>("/api/matches", { authenticated: Boolean(user), next: { revalidate: 60, tags: [MATCHES_CACHE_TAG] } }),
  ]);

  if (!boardsRes.success) throw new Error(boardsRes.error?.message ?? "Failed to load boards");
  const boards = boardsRes.data ?? [];
  const board = boards.find((b) => b.id === boardIdNum);
  // Not a member of this board (removed, or a stale link) → bounce like the board page does.
  if (!board) {
    const fallback = boards.find((b) => b.privacy === "global") ?? boards[0];
    if (fallback) redirect({ href: `/boards/${fallback.id}?notice=board-not-found`, locale });
    notFound();
  }

  // The endpoints only reveal a member's picks after kickoff (they 403 before).
  // Rather than bouncing the viewer back — which reads as a broken navigation —
  // we render the member view and let it show an "not available yet" state.

  // Prefer the roster lookup (full identity, incl. role). When it misses — the
  // members list is paginated and large boards exceed one page — fall back to
  // the name carried in the link so the header isn't a generic "Member".
  const looked = membersRes.success ? (membersRes.data ?? []).find((m) => m.user_id === userId) : undefined;
  const member: BoardMember | null = looked ?? buildMemberFromQuery(userId, sp);

  return (
    <MemberPicksView
      boardId={boardIdNum}
      boardName={board.name}
      userId={userId}
      member={member ?? null}
      initialPickem={pickemRes.success ? (pickemRes.data ?? null) : null}
      initialAwards={awardsRes.success ? (awardsRes.data ?? null) : null}
      standings={standingsRes.success ? (standingsRes.data ?? []) : []}
      matches={matchesRes.success ? (matchesRes.data ?? []) : []}
    />
  );
}

// Build a roster-shaped member from the link's display name + handle so the
// header reads correctly without a successful roster lookup. The name is split
// into first/last so `displayName`/`getInitials` reproduce it; role isn't in the
// link, so it defaults to "member" (only used in the rare lookup-miss path).
function buildMemberFromQuery(userId: string, sp: { n?: string; u?: string }): BoardMember | null {
  const name = sp.n?.trim();
  if (!name) return null;
  const parts = name.split(/\s+/);
  return {
    user_id: userId,
    username: sp.u?.trim() ?? "",
    first_name: parts[0] || null,
    last_name: parts.length > 1 ? parts.slice(1).join(" ") : null,
    role: "member",
    joined_at: "",
  };
}
