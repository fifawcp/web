"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchSessions, revokeAllSessions, revokeSession, SESSIONS_QUERY_KEY } from "../api/sessions";
import type { Session } from "../types/profile.types";

/** Live list of active sessions, refreshed on focus and every 30 s. */
export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: fetchSessions,
    // 30 s — short enough that revoking a session on another tab/device shows
    // up quickly, long enough that we're not hammering the endpoint.
    staleTime: 30_000,
  });
}

/**
 * Revoke a single session. Optimistically removes the row from the cache and
 * rolls back on error. Caller decides what to do post-success (e.g. trigger
 * a sign-out if the revoked session was the current one).
 */
export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeSession,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: SESSIONS_QUERY_KEY });
      const previous = qc.getQueryData<Session[]>(SESSIONS_QUERY_KEY);
      qc.setQueryData<Session[]>(SESSIONS_QUERY_KEY, (rows) => (rows ?? []).filter((s) => s.id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(SESSIONS_QUERY_KEY, ctx.previous);
    },
  });
}

/**
 * Revoke every session. Empties the cache optimistically — the caller is
 * expected to navigate away (sign-out) immediately after success since this
 * device's session is now dead too.
 */
export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeAllSessions,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: SESSIONS_QUERY_KEY });
      const previous = qc.getQueryData<Session[]>(SESSIONS_QUERY_KEY);
      qc.setQueryData<Session[]>(SESSIONS_QUERY_KEY, []);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(SESSIONS_QUERY_KEY, ctx.previous);
    },
  });
}
