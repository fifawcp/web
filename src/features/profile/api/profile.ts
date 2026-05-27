import type { UserRole } from "../types/profile.types";

/**
 * User-profile query/cache key — keyed off the upstream `/api/users/profile`
 * endpoint shape (which we don't yet have a client-side query for, but we
 * pre-register the key so the mutation cache patch can find it).
 */
export const USER_PROFILE_QUERY_KEY = ["users", "profile"] as const;

/** Subset of `domain.User` the edit form is allowed to update. */
export type EditableProfileFields = {
  first_name: string;
  last_name: string;
  username: string;
};

/** Shape we expect `/api/users/profile` to return — mirrors `domain.User` + role. */
export type ApiUserProfile = EditableProfileFields & {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
};

/**
 * Placeholder updater. The backend endpoint doesn't ship yet, so this fakes
 * a successful round-trip (200ms artificial latency so the loading state in
 * the dialog isn't instant). When the real endpoint lands, swap the body
 * for an actual `api.patch<ApiUserProfile>('/api/users/profile', input,
 * { authenticated: true })` call and surface its `ApiClientError` on failure.
 *
 * TODO(backend): replace with the real `PATCH /api/users/profile` (or
 * whichever verb the API team decides on) once the endpoint is exposed.
 * The current form already builds the exact payload shape we expect.
 */
export async function updateUserProfile(input: EditableProfileFields): Promise<EditableProfileFields> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  // TODO(backend): replace with `api.patch<ApiUserProfile>('/api/users/profile', input, { authenticated: true })`
  // and translate failures via `ApiClientError`.
  return input;
}
