import type { BoardListItem } from "@/features/boards/types/boards.types";
import type { StandingRow } from "@/features/standings/types/standings.types";

import type { DashboardData } from "../types/dashboard.types";

import { CardReveal } from "./CardReveal";
import { FeaturedMatchCard } from "./FeaturedMatchCard";
import { GroupStandingsCard } from "./GroupStandingsCard";
import { GuestLanding } from "./GuestLanding";
import { LeaderboardCard } from "./LeaderboardCard";
import { ProgressCardsSection } from "./ProgressCardsSection";
import { QuickActionsCard } from "./QuickActionsCard";
import { SlimBanner } from "./SlimBanner";
import { StatsStrip } from "./StatsStrip";
import { TitleFavoritesCard } from "./TitleFavoritesCard";

type Props = {
  isLoggedIn: boolean;
  data: DashboardData | null;
  currentUserId: string | null;
  lastBoard: BoardListItem | null;
  adminBoards: BoardListItem[];
  standings: StandingRow[];
};

export function DashboardView({ isLoggedIn, data, currentUserId, lastBoard, adminBoards, standings }: Props) {
  // Guests get the dedicated marketing landing; members get the dashboard.
  if (!isLoggedIn) return <GuestLanding data={data} />;

  const nextMatch = data?.next_match ?? null;

  return (
    <div className="relative flex flex-col">
      <section className="container py-6 lg:py-8">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.72fr)_minmax(300px,1fr)] lg:items-stretch">
          {/* Main column — what to do next */}
          <div className="flex min-w-0 flex-col gap-4">
            {nextMatch && <FeaturedMatchCard match={nextMatch} isLoggedIn delay={0} />}
            {data?.stats && <StatsStrip pickedChampion={data.picked_champion} stats={data.stats} delay={0.08} />}
            <CardReveal bare delay={0.12} className="opacity-0">
              <SlimBanner stageCode={nextMatch?.stage_code ?? null} isLoggedIn />
            </CardReveal>
            <ProgressCardsSection progress={data?.progress ?? null} recap={data?.recap ?? null} isLoggedIn delay={0.16} />
            <GroupStandingsCard rows={standings} preferredGroup={nextMatch?.group_code ?? data?.picked_champion?.group_code ?? null} delay={0.24} />
          </div>

          {/* Rail — context and standing (slides in from the right) */}
          <aside className="flex min-w-0 flex-col gap-4">
            <QuickActionsCard board={lastBoard} adminBoards={adminBoards} delay={0.1} from="right" />
            <TitleFavoritesCard favorites={data?.title_favorites ?? []} delay={0.16} from="right" />
            <LeaderboardCard leaderboard={data?.leaderboard ?? null} currentUserId={currentUserId} delay={0.22} from="right" />
          </aside>
        </div>
      </section>
    </div>
  );
}
