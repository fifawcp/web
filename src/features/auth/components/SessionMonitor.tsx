"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { refreshToken } from "../api/client";

const CHECK_INTERVAL_MS = 30_000; // lightweight heartbeat to evaluate token freshness
const ACCESS_TOKEN_SKEW_MS = 120_000; // refresh 2 minutes before access token expiry
const REFRESH_COOLDOWN_MS = 180_000; // minimum spacing between refresh attempts

function decodeJwtExpMs(accessToken: string): number | null {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(normalized));
    if (!json || typeof json.exp !== "number") return null;

    return json.exp * 1000;
  } catch {
    return null;
  }
}

export function SessionMonitor() {
  const { data: session, update } = useSession();
  const inFlightRef = useRef(false); // prevents concurrent refresh requests
  const lastRefreshAtRef = useRef(0); // throttles retries when backend is failing

  useEffect(() => {
    if (!session?.access_token) return;

    const maybeRefresh = async () => {
      const expMs = decodeJwtExpMs(session.access_token);
      if (!expMs) return;

      const now = Date.now();
      const shouldRefresh = now >= expMs - ACCESS_TOKEN_SKEW_MS;
      if (!shouldRefresh) return;
      // Guard 1: ignore ticks while a refresh is still running.
      if (inFlightRef.current) return;
      // Guard 2: avoid refresh bursts (e.g. intermittent errors or multiple rerenders).
      if (now - lastRefreshAtRef.current < REFRESH_COOLDOWN_MS) return;

      inFlightRef.current = true;
      lastRefreshAtRef.current = now;

      try {
        const res = await refreshToken();
        if (!res.success) {
          // Refresh cookie is no longer valid (or backend rejects it) -> terminate session.
          await signOut({ callbackUrl: "/login" });
          return;
        }

        const { access_token, expires_at } = res.data!;
        // Update the session with the new auth data
        await update({ access_token, expires_at });
      } catch {
        // If there is an error, terminate the session
        await signOut({ callbackUrl: "/login" });
        return;
      } finally {
        inFlightRef.current = false;
      }
    };

    void maybeRefresh();
    // Set up a periodic check to refresh the token
    const id = setInterval(() => {
      void maybeRefresh();
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [session?.access_token, update]);

  return null;
}
