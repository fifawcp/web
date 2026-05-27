import { api } from "@/shared/lib/api/client";

import type { Session } from "../types/profile.types";

export const SESSIONS_QUERY_KEY = ["auth", "sessions"] as const;

/**
 * List every active session for the current user. The backend reads the
 * caller from the `refresh_token` cookie (same-origin, set by next-auth +
 * the upstream auth flow), so this call is unauthenticated as far as the
 * Bearer header is concerned.
 */
export async function fetchSessions(): Promise<Session[]> {
  const res = await api.get<Session[]>("/api/auth/sessions");
  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? "Failed to load sessions");
  }
  return res.data;
}

/** Revoke a single session by id. Requires the access token (BearerAuth). */
export async function revokeSession(id: string): Promise<void> {
  const res = await api.delete<void>(`/api/auth/sessions/${id}`, { authenticated: true });
  if (!res.success) {
    throw new Error(res.error?.message ?? "Failed to revoke session");
  }
}

/** Revoke every session for the current user (including this one). */
export async function revokeAllSessions(): Promise<void> {
  const res = await api.post<void>("/api/auth/logout/all");
  if (!res.success) {
    throw new Error(res.error?.message ?? "Failed to log out from all devices");
  }
}
