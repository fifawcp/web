import { Suspense } from "react";
import type { Metadata } from "next";

import { PICKEMS_CACHE_TAG } from "@/features/standings/api/pickems";
import { STANDINGS_CACHE_TAG } from "@/features/standings/api/standings";
import { StandingsView } from "@/features/standings/components/StandingsView";
import { buildPickIndex } from "@/features/standings/lib/comparison";
import { groupAndEnrichStandings } from "@/features/standings/lib/groupStandings";
import { MOCK_PICKEMS } from "@/features/standings/lib/mockData";
import type { PickemState, PickIndex, StandingRow } from "@/features/standings/types/standings.types";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

export const metadata: Metadata = { title: "Standings | WCP" };

export default async function StandingsPage() {
  const user = await getCurrentUser();

  // Public endpoint — guests welcome. Mock data covers us until the backend is live;
  // the 3s timeout keeps page loads snappy while the upstream is unreachable.
  const standingsRes = await serverApi.get<StandingRow[]>("/api/standings", {
    authenticated: false,
    next: { revalidate: 60, tags: [STANDINGS_CACHE_TAG] },
  });

  if (!standingsRes.success || !standingsRes.data) {
    throw new Error(standingsRes.error?.message ?? "Failed to load standings");
  }

  const groups = groupAndEnrichStandings(standingsRes.data);

  // Auth users also get the picks overlay (YOU / Δ + per-group accuracy badge).
  let pickIndex: PickIndex | null = null;
  if (user) {
    const picksRes = await serverApi.get<PickemState>("/api/pickems", {
      authenticated: true,
      next: { revalidate: 60, tags: [PICKEMS_CACHE_TAG] },
    });
    console.log(picksRes);
    const picks = picksRes.success && picksRes.data ? picksRes.data : MOCK_PICKEMS;
    pickIndex = buildPickIndex(picks);
  }

  return (
    <Suspense>
      <StandingsView groups={groups} pickIndex={pickIndex} />;
    </Suspense>
  );
}
