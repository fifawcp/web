import { Suspense } from "react";

import { getMatchPickProgress, getTournamentAwards, getUserPickemSummary } from "../api/dashboard.api";

import { PickStatusCard } from "./PickStatusCard";

type Props = {
  isLoggedIn: boolean;
};

async function PickStatusContent({ isLoggedIn }: Props) {
  if (!isLoggedIn) {
    return <PickStatusCard pickem={null} matchProgress={null} awards={null} isLoggedIn={false} />;
  }

  const [pickem, matchProgress, awards] = await Promise.all([getUserPickemSummary(), getMatchPickProgress(), getTournamentAwards()]);

  return <PickStatusCard pickem={pickem} matchProgress={matchProgress} awards={awards} isLoggedIn={true} />;
}

function PickStatusLoading() {
  return (
    <div className="bg-card rounded-xl border border-border animate-pulse">
      <div className="flex items-center px-4 py-3 border-b border-border">
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4 border-b border-border last:border-b-0">
          <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
            <div className="h-1.5 w-full bg-muted rounded-full" />
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PickStatusSection({ isLoggedIn }: Props) {
  return (
    <Suspense fallback={isLoggedIn ? <PickStatusLoading /> : null}>
      <PickStatusContent isLoggedIn={isLoggedIn} />
    </Suspense>
  );
}
