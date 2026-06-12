"use client";

import { useQuery } from "@tanstack/react-query";

import type { UserAwards } from "@/features/awards/types/awards.types";
import type { UserPickem } from "@/features/pickems/types/pickems.types";

import { fetchMemberAwards, fetchMemberPickem, memberAwardsKey, memberPickemKey } from "../api/memberPicks";

// Seeded from the RSC `initialData`; the queryFn only runs on a client refetch.
export function useMemberPickem(boardId: number, userId: string, initialData?: UserPickem) {
  return useQuery({
    queryKey: memberPickemKey(boardId, userId),
    queryFn: () => fetchMemberPickem(boardId, userId),
    initialData,
  });
}

export function useMemberAwards(boardId: number, userId: string, initialData?: UserAwards) {
  return useQuery({
    queryKey: memberAwardsKey(boardId, userId),
    queryFn: () => fetchMemberAwards(boardId, userId),
    initialData,
  });
}
