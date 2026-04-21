"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/features/auth/store/auth.store";

interface GuestOnlyRouteProps {
  children: React.ReactNode;
}

export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { isAuthenticated, _hasHydrated, isInitializing } = useAuthStore();
  const router = useRouter();
  const t = useTranslations("auth.common");

  useEffect(() => {
    // Only check authentication after hydration AND initialization (token refresh) complete
    if (_hasHydrated && !isInitializing && isAuthenticated()) {
      router.replace("/home");
    }
  }, [isAuthenticated, _hasHydrated, isInitializing, router]);

  // Show loading state while waiting for hydration and token refresh
  if (!_hasHydrated || isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-wc-red border-t-transparent" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Don't render children if authenticated (redirect will happen)
  if (isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
