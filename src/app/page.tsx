import { Suspense } from "react";

import { DashboardLoading, DashboardView } from "@/features/dashboard";
import { getDashboard } from "@/features/dashboard/api/dashboard.api";
import { getCurrentUser } from "@/lib/auth";

async function DashboardContent() {
  const user = await getCurrentUser();
  const data = await getDashboard(!!user);
  return <DashboardView isLoggedIn={!!user} data={data} currentUserId={user?.id ?? null} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
