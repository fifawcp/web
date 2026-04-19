"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { useAuthRefresh } from "../hooks/useAuthRefresh";
import { refreshToken } from "../api/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, expiresAt, setAuth, clearAuth, user, isTokenExpired } = useAuthStore();
  useAuthRefresh();

  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken && expiresAt) {
        if (isTokenExpired()) {
          const response = await refreshToken();

          if (response.success && response.data && user) {
            const { access_token, expires_at } = response.data.data;
            setAuth(access_token, expires_at, user);
          } else {
            clearAuth();
          }
        }
      }
    };

    initializeAuth();
  }, []);

  return <>{children}</>;
}
