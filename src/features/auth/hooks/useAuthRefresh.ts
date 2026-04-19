import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/auth.store";
import { refreshToken } from "../api/client";

const REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh 5 minutes before expiration

export function useAuthRefresh() {
  const { accessToken, expiresAt, setAuth, clearAuth, user } = useAuthStore();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleTokenRefresh = (expiresAtDate: Date) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const now = new Date().getTime();
    const expiresAtTime = expiresAtDate.getTime();
    const timeUntilRefresh = expiresAtTime - now - REFRESH_THRESHOLD;

    if (timeUntilRefresh <= 0) {
      performTokenRefresh();
    } else {
      refreshTimeoutRef.current = setTimeout(() => {
        performTokenRefresh();
      }, timeUntilRefresh);
    }
  };

  const performTokenRefresh = async () => {
    const response = await refreshToken();

    if (response.success && response.data && user) {
      const { access_token, expires_at } = response.data.data;
      setAuth(access_token, expires_at, user);
      scheduleTokenRefresh(new Date(expires_at));
    } else {
      clearAuth();
    }
  };

  useEffect(() => {
    if (accessToken && expiresAt) {
      const expiresAtDate = new Date(expiresAt);
      const now = new Date();

      if (expiresAtDate <= now) {
        performTokenRefresh();
      } else {
        scheduleTokenRefresh(expiresAtDate);
      }
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [accessToken, expiresAt]);

  return { performTokenRefresh };
}
