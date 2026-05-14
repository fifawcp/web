import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";

import { getUserDashboardStats } from "../api/dashboard.api";
import type { UserDashboardStats } from "../types/dashboard.types";

import { AuthHero } from "./AuthHero";

async function AuthHeroContent() {
  const user = await getCurrentUser();
  let stats: UserDashboardStats | null = null;

  if (user) {
    stats = await getUserDashboardStats(user.id);
  }

  const isNewUser = !stats;
  const bracketProgress = stats ? { current: stats.bracketComplete, total: stats.bracketTotal } : { current: 0, total: 32 };

  return <AuthHero stats={stats} bracketProgress={bracketProgress} isNewUser={isNewUser} />;
}

function AuthHeroLoading() {
  return (
    <section className="border-b border-border container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative p-6 md:p-8  bg-linear-to-br from-primary/10 via-background to-background border border-primary/20 rounded-lg animate-pulse">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5] dark:opacity-[0.14]"
          style={{
            backgroundImage: "url('/banner-stadium.png')",
            backgroundPosition: "bottom right",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            maskImage: "radial-gradient(circle at bottom right, black 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at bottom right, black 0%, transparent 70%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-white/20 dark:bg-black/20" />
        <div className="flex flex-col gap-4 relative z-10">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-15 md:h-10 w-full max-w-2xl bg-muted rounded" />
          <div className="h-8 w-full max-w-xl bg-muted rounded" />
          <div className="h-5 w-full md:w-20 bg-muted rounded" />
          <div className="flex flex-col md:flex-row items-stretch md:divide-x divide-border border-t border-border pt-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 md:px-4 md:py-3 lg:flex-1 min-w-32 lg:min-w-46 border-b border-border md:border-b-0">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-6 w-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AuthHeroSection() {
  return (
    <Suspense fallback={<AuthHeroLoading />}>
      <AuthHeroContent />
    </Suspense>
  );
}
