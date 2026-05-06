"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { regenerateJoinCode } from "@/features/boards/api/client";
import { useApiError } from "@/shared/hooks/useApiError";

export function useRegenerateJoinCode(boardId: string) {
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const apiError = useApiError();

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    apiError.clear();

    const res = await regenerateJoinCode(boardId);
    setIsRegenerating(false);

    if (!res.success) {
      apiError.set(res.error);
      return;
    }

    setJoinCode(res.data!.join_code);
    router.refresh();
  };

  return {
    handleRegenerate,
    isRegenerating,
    joinCode,
    apiError,
  };
}
