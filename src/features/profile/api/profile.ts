import { api } from "@/shared/lib/api/client";
import { ApiClientError } from "@/shared/lib/api/errors";
import type { User } from "@/shared/types/interfaces";

import type { UserRole } from "../types/profile.types";

/**
 * User-profile query/cache key — keyed off the upstream `/api/users/profile`
 * endpoint shape (which we don't yet have a client-side query for, but we
 * pre-register the key so the mutation cache patch can find it).
 */
export const USER_PROFILE_QUERY_KEY = ["users", "profile"] as const;

/** Subset of `domain.User` the edit form is allowed to update. */
export type EditableProfileFields = Pick<User, "first_name" | "last_name" | "username">;

/** Shape `/api/users/profile` returns — `domain.User` + the role enum
 *  that isn't on the next-auth session. Canonical location for this
 *  type; previously also redeclared in `app/[locale]/profile/page.tsx`. */
export type ApiUserProfile = User & { role: UserRole };

/**
 * Partial-update of the authenticated user's profile. Only the fields
 * present in `input` are sent — email is mutated through a dedicated
 * endpoint and `role` is server-managed (never updatable from the UI).
 *
 * The backend wraps the user in `{ data: { ... } }`; `api.patch` already
 * unwraps that envelope. On failure we throw `ApiClientError` so the
 * caller (`useUpdateProfile` → `EditProfileDialog`) can run the code
 * through `translateApiError` and surface a locale-aware message — the
 * raw `res.error.message` is always backend-locale (English) and would
 * leak through to Spanish UIs otherwise. This mirrors how the
 * registration flow handles the same family of errors
 * (`USERNAME_ALREADY_EXISTS`, validation failures, etc.).
 */
export async function updateUserProfile(input: EditableProfileFields): Promise<ApiUserProfile> {
  const res = await api.patch<ApiUserProfile>("/api/users/profile", input, { authenticated: true });
  if (!res.success || !res.data) {
    throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? "Failed to update profile");
  }
  return res.data;
}
