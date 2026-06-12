"use client";

import { hasTournamentStarted } from "@/features/dashboard/lib/tournamentConfig";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

type Props = {
  boardId: number;
  userId: string;
  currentUserId: string;
  /** Display name — rendered here and carried to the picks page. */
  name: string;
  /** @-handle — carried to the picks page. */
  username: string;
  className?: string;
};

/**
 * A board member's name in a leaderboard, linking to their picks page. Only
 * links after kickoff (picks aren't viewable before) and never the viewer's own
 * row (they edit at /pickems); otherwise renders plain text.
 *
 * The identity travels in the query string so the picks page can title itself
 * correctly without a roster lookup — that lookup is paginated and misses
 * members past the first page (especially on large boards), which is what made
 * the header fall back to "Member".
 */
export function MemberNameLink({ boardId, userId, currentUserId, name, username, className }: Props) {
  const canView = hasTournamentStarted() && userId !== currentUserId;
  if (!canView) return <span className={cn("truncate", className)}>{name}</span>;
  const href = `/boards/${boardId}/members/${userId}?n=${encodeURIComponent(name)}&u=${encodeURIComponent(username)}`;
  return (
    <Link href={href} className={cn("truncate underline-offset-2 transition-colors hover:text-page-accent hover:underline", className)}>
      {name}
    </Link>
  );
}
