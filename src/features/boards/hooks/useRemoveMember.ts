"use client";

import { useState } from "react";

import { removeBoardMember } from "@/features/boards/api/client";
import { useApiError } from "@/shared/hooks/useApiError";

export function useRemoveMember(boardId: string, onSuccess?: () => void) {
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const apiError = useApiError();

  const handleRemove = async (userId: string) => {
    setRemovingUserId(userId);
    apiError.clear();

    const res = await removeBoardMember(boardId, userId);
    setRemovingUserId(null);

    if (!res.success) {
      apiError.set(res.error);
      return;
    }

    // Call refresh callback to update client state
    onSuccess?.();
  };

  return {
    handleRemove,
    removingUserId,
    apiError,
  };
}
