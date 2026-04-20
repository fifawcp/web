"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { refreshToken } from "@/features/auth/api/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, expiresAt, setAuth, clearAuth, user, isTokenExpired } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken && expiresAt) {
        if (isTokenExpired()) {
          const response = await refreshToken();

          if (response.data && user) {
            const { access_token, expires_at } = response.data.data;
            setAuth(access_token, expires_at, user);
          } else {
            clearAuth();
          }
        }
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
