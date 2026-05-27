"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import type { ApiUserProfile, EditableProfileFields } from "../api/profile";
import { updateUserProfile, USER_PROFILE_QUERY_KEY } from "../api/profile";

type Context = { previous: ApiUserProfile | undefined };

/**
 * Mutation hook for editing the editable profile fields (first/last name,
 * username). Four-stage update on success — every consumer of the user's
 * identity has to be poked, because they read from different sources:
 *
 *   1. `onMutate`: optimistic patch on the React Query cache so the
 *      surrounding UI (IdentityHero) reflects the change immediately.
 *   2. `onSuccess` → cache: overwrite the React Query cache with the
 *      server's authoritative response (carries the refreshed
 *      `updated_at` and any server-side normalisation).
 *   3. `onSuccess` → session: call `useSession().update(...)` so the
 *      Next-Auth JWT cookie picks up the new identity fields.
 *   4. `onSuccess` → `router.refresh()`: re-renders Server Components
 *      (the `Header` reads `getCurrentUser()` server-side; updating
 *      the JWT alone won't bust its already-rendered HTML).
 *
 * `onError` restores the snapshot taken in `onMutate` so a failed save
 * rolls the React Query cache back to its pre-mutation state.
 */
export function useUpdateProfile() {
  const qc = useQueryClient();
  const router = useRouter();
  const { update: updateSession } = useSession();

  return useMutation<ApiUserProfile, Error, EditableProfileFields, Context>({
    mutationFn: updateUserProfile,
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      const previous = qc.getQueryData<ApiUserProfile>(USER_PROFILE_QUERY_KEY);
      if (previous) {
        qc.setQueryData<ApiUserProfile>(USER_PROFILE_QUERY_KEY, { ...previous, ...input });
      }
      return { previous };
    },
    onSuccess: async (data) => {
      qc.setQueryData<ApiUserProfile>(USER_PROFILE_QUERY_KEY, data);
      // Propagate to the Next-Auth JWT. The matching handler in
      // `[...nextauth]/route.ts` patches only the fields it recognises,
      // so this is safe even though the JWT carries more than profile.
      await updateSession({
        user: {
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          updated_at: data.updated_at,
        },
      });
      // Bust Server-Component caches that captured the pre-edit session
      // at render time (Header, page-level RSC reads of `getCurrentUser()`).
      // `router.refresh()` re-fetches the active route on the server and
      // reconciles in place — no client-state loss, no full reload.
      router.refresh();
    },
    onError: (_err, _input, context) => {
      if (context?.previous) qc.setQueryData(USER_PROFILE_QUERY_KEY, context.previous);
    },
  });
}
