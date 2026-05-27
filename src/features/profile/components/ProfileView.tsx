"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";

import type { BoardListItem } from "@/features/boards/types/boards.types";
import type { DashboardData } from "@/features/dashboard/types/dashboard.types";
import type { User } from "@/shared/types/interfaces";

import { profileRevealAnimation } from "../animations/profile.animations";
import type { MatchPair } from "../lib/deriveMatchPair";
import type { UserRole } from "../types/profile.types";

import { BoardsPeek } from "./BoardsPeek";
import { CalendarPeek } from "./CalendarPeek";
import { IdentityHero } from "./IdentityHero";
import { ManagementTabs } from "./ManagementTabs";
import { PickemPeek } from "./PickemPeek";

type Props = {
  user: User;
  /** From `domain.User.role`. Backend currently sends "user" | "admin". */
  role: UserRole;
  /** Dashboard payload — champion, pickem progress. Null degrades to empty peeks. */
  dashboard: DashboardData | null;
  /** Derived from /api/matches — last finished + next upcoming + tournament-started flag. */
  matchPair: MatchPair;
  /** Every board the user belongs to. Null = fetch failed → BoardsPeek shows error state. */
  boards: BoardListItem[] | null;
};

/**
 * Profile is the user's personal hub: identity at the top, three peeks into
 * the domain pages (pickem / boards / calendar) in the middle, and the
 * management surface (preferences / devices / account) at the bottom.
 *
 * Deliberately distinct from the dashboard:
 *   - Dashboard frames the tournament; Profile frames the user.
 *   - Dashboard data is read-only summary; Profile peeks each link out to
 *     the editable page they sample from.
 *   - Settings live here only — the global header keeps the small popover.
 */
export function ProfileView({ user, role, dashboard, matchPair, boards }: Props) {
  const t = useTranslations("profile");

  const revealRoot = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!revealRoot.current) return;
      const items = revealRoot.current.querySelectorAll<HTMLElement>("[data-reveal]");
      if (items.length === 0) return;
      return profileRevealAnimation({ items });
    },
    { scope: revealRoot }
  );

  return (
    <div ref={revealRoot} className="container mx-auto flex w-full flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <span className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-page-accent" />
          {t("eyebrow")}
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title", { name: user.first_name || user.username })}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div data-reveal>
        <IdentityHero username={user.username} firstName={user.first_name} lastName={user.last_name} email={user.email} createdAt={user.created_at} role={role} />
      </div>

      <div data-reveal>
        <PickemPeek progress={dashboard?.progress.pickem ?? null} champion={dashboard?.picked_champion ?? null} isLocked={matchPair.isTournamentStarted} />
      </div>

      {/* Boards ↔ Calendar — equal columns on lg, stacked on smaller widths. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div data-reveal>
          <BoardsPeek boards={boards} isError={boards === null} />
        </div>
        <div data-reveal>
          <CalendarPeek lastPlayed={matchPair.lastPlayed} nextUpcoming={matchPair.nextUpcoming} />
        </div>
      </div>

      <div data-reveal>
        <ManagementTabs />
      </div>
    </div>
  );
}
