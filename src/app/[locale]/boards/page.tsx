import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { BOARDS_LIST_TAG } from "@/features/boards/api/boards";
import { BoardEmptyState } from "@/features/boards/components/BoardEmptyState";
import { LAST_BOARD_COOKIE } from "@/features/boards/lib/lastBoardCookie";
import type { BoardListItem } from "@/features/boards/types/boards.types";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

type Props = {
  searchParams: Promise<{ board?: string; dialog?: string }>;
};

export default async function BoardsIndex({ searchParams }: Props) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  if (!user) redirect({ href: "/login", locale });

  const [{ board, dialog }, cookieStore, boardsRes] = await Promise.all([
    searchParams,
    cookies(),
    serverApi.get<BoardListItem[]>("/api/boards", {
      authenticated: true,
      next: { revalidate: 30, tags: [BOARDS_LIST_TAG] },
    }),
  ]);

  if (!boardsRes.success) throw new Error(boardsRes.error?.message ?? "Failed to load boards");

  const boards = boardsRes.data ?? [];
  // Empty state reads ?dialog= itself to auto-open the create/join modal.
  if (boards.length === 0) return <BoardEmptyState />;

  const globalBoard = boards.find((b) => b.privacy === "global");
  const lastBoardId = Number(cookieStore.get(LAST_BOARD_COOKIE)?.value);
  const target = board === "global" && globalBoard ? globalBoard : (Number.isFinite(lastBoardId) && boards.find((b) => b.id === lastBoardId)) || globalBoard || boards[0];

  const query = dialog === "create" || dialog === "join" ? `?dialog=${dialog}` : "";
  redirect({ href: `/boards/${target.id}${query}`, locale });
}
