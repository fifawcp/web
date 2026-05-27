import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { BOARDS_LIST_TAG } from "@/features/boards/api/boards";
import type { BoardListItem } from "@/features/boards/types/boards.types";
import { getDashboard } from "@/features/dashboard/api/dashboard.api";
import { ProfileView } from "@/features/profile/components/ProfileView";
import { deriveMatchPair } from "@/features/profile/lib/deriveMatchPair";
import type { UserRole } from "@/features/profile/types/profile.types";
import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";
import type { Match } from "@/features/schedule/types/schedule.types";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";
import { buildPageMetadata } from "@/shared/seo/metadata";
import type { User } from "@/shared/types/interfaces";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.profile", path: "/profile" });
}

/** Domain.User extends the session shape with the role enum. */
type ApiUser = User & { role: UserRole };

export default async function ProfilePage() {
  const [session, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  // Defence-in-depth — `src/proxy.ts` middleware already gates this route,
  // but the redirect guarantees we never render a profile without a user
  // even if the matcher misses an edge case. Locale-aware `redirect` keeps
  // the user on their current locale prefix.
  if (!session) redirect({ href: "/login", locale });

  // Four server-side fetches, in parallel:
  //   /api/users/profile → identity + role (role isn't on the next-auth session)
  //   /api/dashboard     → champion + pickem progress (used by PickemPeek)
  //   /api/matches       → full match list; we derive last/next here rather
  //                        than trusting dashboard.next_match (which can lag).
  //   /api/boards        → every board the user belongs to — drives BoardsPeek
  //                        directly (replaces the global-only dashboard.stats path).
  //
  // Sessions stay client-side via `useSessions` — only loaded when the
  // user opens the "Devices" tab inside ManagementTabs.
  const [userRes, dashboard, matchesRes, boardsRes] = await Promise.all([
    serverApi.get<ApiUser>("/api/users/profile", { authenticated: true }),
    getDashboard(true),
    serverApi.get<Match[]>("/api/matches", {
      authenticated: true,
      next: { revalidate: 60, tags: [MATCHES_CACHE_TAG] },
    }),
    serverApi.get<BoardListItem[]>("/api/boards", {
      authenticated: true,
      next: { revalidate: 30, tags: [BOARDS_LIST_TAG] },
    }),
  ]);

  if (!userRes.success || !userRes.data) {
    throw new Error(userRes.error?.message ?? "Failed to load profile");
  }

  const { role, ...user } = userRes.data;
  // `deriveMatchPair` tolerates null/empty — a matches fetch failure degrades
  // CalendarPeek to its empty state instead of breaking the page.
  const matchPair = deriveMatchPair(matchesRes.success ? matchesRes.data : null);
  // null signals "fetch failed" to BoardsPeek so it can surface a retry-state
  // instead of pretending the user has zero boards.
  const boards = boardsRes.success ? (boardsRes.data ?? []) : null;

  return <ProfileView user={user} role={role ?? "user"} dashboard={dashboard} matchPair={matchPair} boards={boards} />;
}
