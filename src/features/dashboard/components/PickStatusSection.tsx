import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";

import { getUserPickStatus } from "../api/dashboard.api";
import type { PickStatusData } from "../types/dashboard.types";

import { PickStatusCard } from "./PickStatusCard";

async function PickStatusContent() {
  const user = await getCurrentUser();
  let data: PickStatusData | null = null;

  if (user) {
    data = await getUserPickStatus(user.id);
  }

  return <PickStatusCard data={data} />;
}

function PickStatusLoading() {
  return (
    <div className="bg-card rounded-lg border border-border animate-pulse">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PickStatusSection() {
  return (
    <Suspense fallback={<PickStatusLoading />}>
      <PickStatusContent />
    </Suspense>
  );
}
