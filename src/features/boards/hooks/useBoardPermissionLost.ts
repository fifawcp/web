"use client";

import { useCallback } from "react";

import { useRouter } from "@/i18n/navigation";

import { revalidateBoard } from "../api/boards";

// A board action returned FORBIDDEN (the viewer's role changed under them) — bust the stale board
// cache before refreshing so the RSC drops now-forbidden controls.
export function useBoardPermissionLost(boardId: number, onBefore?: () => void) {
  const router = useRouter();
  return useCallback(async () => {
    onBefore?.();
    await revalidateBoard(boardId);
    router.refresh();
  }, [boardId, onBefore, router]);
}
