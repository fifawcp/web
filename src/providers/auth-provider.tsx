"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { refreshToken } from "@/features/auth/api/client";
import { logger } from "@/shared/lib/logger";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, user, _hasHydrated, setIsInitializing, clearAuth } = useAuthStore();

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage before checking user
    if (!_hasHydrated) {
      logger.info("[AuthProvider] Waiting for hydration...");
      return;
    }

    const initializeAuth = async () => {
      logger.info("[AuthProvider] Hydration complete, user from storage:", user);

      // Only attempt refresh if we have a persisted user (means they logged in before)
      if (!user) {
        logger.info("[AuthProvider] No user in storage, skipping refresh");
        setIsInitializing(false);
        return;
      }

      // Attempt silent token refresh on mount to restore session from cookie
      logger.info("[AuthProvider] Attempting token refresh...");
      const response = await refreshToken();

      if (response.success && response.data) {
        const { access_token, expires_at } = response.data.data;
        logger.info("[AuthProvider] Token refresh successful");
        setAuth(access_token, expires_at, user);
      } else {
        logger.error("[AuthProvider] Token refresh failed:", response.error);
        clearAuth();
      }

      setIsInitializing(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  return <>{children}</>;
}
