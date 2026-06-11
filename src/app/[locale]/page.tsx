import { Suspense } from "react";
import { cookies } from "next/headers";

import { BOARDS_LIST_TAG } from "@/features/boards/api/boards";
import { LAST_BOARD_COOKIE } from "@/features/boards/lib/lastBoardCookie";
import type { BoardListItem } from "@/features/boards/types/boards.types";
import { DashboardLoading, DashboardView, LandingLoading } from "@/features/dashboard";
import { getDashboard } from "@/features/dashboard/api/dashboard.api";
import { STANDINGS_CACHE_TAG } from "@/features/standings/api/standings";
import type { StandingRow } from "@/features/standings/types/standings.types";
import { getCurrentUser } from "@/lib/auth";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/shared/components/JsonLd";
import { serverApi } from "@/shared/lib/api/server";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: ["en", "es"],
    },
  ],
};

type BoardsContext = {
  // Last visited board (cookie) → first board fallback; powers the "your board" quick action.
  lastBoard: BoardListItem | null;
  // Boards where the viewer can create a competition (admin/owner, non-global).
  adminBoards: BoardListItem[];
};

async function getBoardsContext(): Promise<BoardsContext> {
  const [cookieStore, boardsRes] = await Promise.all([
    cookies(),
    serverApi.get<BoardListItem[]>("/api/boards", {
      authenticated: true,
      next: { revalidate: 30, tags: [BOARDS_LIST_TAG] },
    }),
  ]);

  const boards = boardsRes.success ? (boardsRes.data ?? []) : [];
  if (boards.length === 0) return { lastBoard: null, adminBoards: [] };

  const lastBoardId = Number(cookieStore.get(LAST_BOARD_COOKIE)?.value);
  const lastBoard = (Number.isFinite(lastBoardId) && boards.find((b) => b.id === lastBoardId)) || boards[0];
  const adminBoards = boards.filter((b) => (b.role === "owner" || b.role === "admin") && b.privacy !== "global");

  return { lastBoard, adminBoards };
}

// Group standings snapshot data — public endpoint, returns all rows (filtered client-side by group).
async function getStandings(): Promise<StandingRow[]> {
  const res = await serverApi.get<StandingRow[]>("/api/standings", {
    next: { revalidate: 60, tags: [STANDINGS_CACHE_TAG] },
  });
  return res.success ? (res.data ?? []) : [];
}

type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;

async function DashboardContent({ user }: { user: CurrentUser }) {
  const isAuthed = !!user;
  const [data, boards, standings] = await Promise.all([
    getDashboard(isAuthed),
    isAuthed ? getBoardsContext() : Promise.resolve<BoardsContext>({ lastBoard: null, adminBoards: [] }),
    isAuthed ? getStandings() : Promise.resolve<StandingRow[]>([]),
  ]);
  return (
    <DashboardView
      isLoggedIn={isAuthed}
      data={data}
      currentUserId={user?.id ?? null}
      lastBoard={boards.lastBoard}
      adminBoards={boards.adminBoards}
      standings={standings}
    />
  );
}

export default async function DashboardPage() {
  // Resolve auth up-front so the Suspense fallback matches the tree being streamed
  // (authed dashboard vs. guest landing).
  const user = await getCurrentUser();

  return (
    <div data-accent="purple" className="contents">
      <JsonLd data={structuredData} />
      <Suspense fallback={user ? <DashboardLoading /> : <LandingLoading />}>
        <DashboardContent user={user} />
      </Suspense>
    </div>
  );
}
