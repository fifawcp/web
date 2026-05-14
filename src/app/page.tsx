import { AuthDashboard, GuestDashboard } from "@/features/dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <GuestDashboard />;
  } else {
    return <AuthDashboard />;
  }
}
