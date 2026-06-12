import type { UserAwards } from "@/features/awards/types/awards.types";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import { api } from "@/shared/lib/api/client";
import { ApiClientError } from "@/shared/lib/api/errors";
import type { ApiResponse } from "@/shared/lib/api/types";

// Board-scoped reads of another member's committed predictions. Both endpoints
// return the same bare domain objects as the viewer's own `/pickems` and
// `/awards` (no member-info wrapping), so the existing read-only renderers
// consume them directly. The member's identity comes from the board roster.

// Cache tags for the RSC fetch (server side); keep them per-member so a future
// revalidation can target a single member without dumping the whole board.
export const memberPickemTag = (boardId: number, userId: string) => `boards:${boardId}:member:${userId}:pickem` as const;
export const memberAwardsTag = (boardId: number, userId: string) => `boards:${boardId}:member:${userId}:awards` as const;

// TanStack Query keys for the client hooks seeded from the server `initialData`.
export const memberPickemKey = (boardId: number, userId: string) => ["boards", boardId, "member", userId, "pickem"] as const;
export const memberAwardsKey = (boardId: number, userId: string) => ["boards", boardId, "member", userId, "awards"] as const;

function unwrap<T>(res: ApiResponse<T>, fallback: string): T {
  if (res.success && res.data !== undefined) return res.data;
  throw new ApiClientError(res.error?.code ?? "UNKNOWN_ERROR", res.error?.message ?? fallback);
}

export async function fetchMemberPickem(boardId: number, userId: string): Promise<UserPickem> {
  return unwrap(await api.get<UserPickem>(`/api/boards/${boardId}/members/${userId}/pickem`, { authenticated: true }), "Failed to load member pick'em");
}

export async function fetchMemberAwards(boardId: number, userId: string): Promise<UserAwards> {
  return unwrap(await api.get<UserAwards>(`/api/boards/${boardId}/members/${userId}/awards`, { authenticated: true }), "Failed to load member awards");
}
