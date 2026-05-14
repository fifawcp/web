import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";

import { getGlobalTop5 } from "../api/dashboard.api";
import type { TopGlobal } from "../types/dashboard.types";

import { BoardTop5Card } from "./BoardTop5Card";

async function GlobalTop5Content() {
  const user = await getCurrentUser();
  let data: TopGlobal | null = null;

  if (user) {
    data = await getGlobalTop5();
  }

  return <BoardTop5Card data={data} />;
}

function GlobalTop5Loading() {
  return (
    <div className="bg-card rounded-lg border border-border animate-pulse">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
      <div className="flex flex-col">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b border-border last:border-b-0">
            <div className="h-5 w-5 bg-muted rounded" />
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 h-4 bg-muted rounded" />
            <div className="h-4 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GlobalTop5Section() {
  return (
    <Suspense fallback={<GlobalTop5Loading />}>
      <GlobalTop5Content />
    </Suspense>
  );
}
