import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";

import { getDashboardLeaderboard } from "../api/dashboard.api";

import { CombinedLeaderboardCard } from "./CombinedLeaderboardCard";

type Props = {
  isLoggedIn: boolean;
};

async function LeaderboardContent({ isLoggedIn }: Props) {
  const [user, leaderboard] = await Promise.all([isLoggedIn ? getCurrentUser() : Promise.resolve(null), getDashboardLeaderboard()]);

  return <CombinedLeaderboardCard pickem={leaderboard?.pickem ?? null} match={leaderboard?.match ?? null} currentUserId={user?.id ?? null} />;
}

function LeaderboardLoading() {
  return (
    <div className="bg-card rounded-xl border border-border animate-pulse h-full">
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col flex-1">
            <div className="flex items-center px-4 py-3 border-b border-border">
              <div className="h-4 w-28 bg-muted rounded" />
            </div>
            <div className="flex flex-col">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center gap-2 px-4 py-2.5 border-b border-border last:border-b-0">
                  <div className="h-4 w-4 bg-muted rounded" />
                  <div className="h-7 w-7 rounded-full bg-muted" />
                  <div className="flex-1 h-4 bg-muted rounded" />
                  <div className="h-4 w-10 bg-muted rounded" />
                </div>
              ))}
            </div>
            <div className="flex justify-end px-4 py-3 border-t border-border">
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSection({ isLoggedIn }: Props) {
  return (
    <Suspense fallback={<LeaderboardLoading />}>
      <LeaderboardContent isLoggedIn={isLoggedIn} />
    </Suspense>
  );
}
