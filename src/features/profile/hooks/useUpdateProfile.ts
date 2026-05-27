"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiUserProfile, EditableProfileFields } from "../api/profile";
import { updateUserProfile, USER_PROFILE_QUERY_KEY } from "../api/profile";

type Context = { previous: ApiUserProfile | undefined };

/**
 * Mutation hook for editing the editable profile fields (first/last name,
 * username). Optimistically patches the `users/profile` cache so the
 * surrounding UI (IdentityHero) reflects the new values immediately, and
 * rolls back on error.
 *
 * The actual upstream call lives in `updateUserProfile` — currently a
 * placeholder until the backend ships the endpoint. When that lands the
 * mutation contract here doesn't change; just the API call body does.
 */
export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation<EditableProfileFields, Error, EditableProfileFields, Context>({
    mutationFn: updateUserProfile,
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      const previous = qc.getQueryData<ApiUserProfile>(USER_PROFILE_QUERY_KEY);
      if (previous) {
        qc.setQueryData<ApiUserProfile>(USER_PROFILE_QUERY_KEY, { ...previous, ...input });
      }
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) qc.setQueryData(USER_PROFILE_QUERY_KEY, context.previous);
    },
  });
}
