import { DashboardView } from "@/features/dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return <DashboardView isLoggedIn={!!user} />;
}
