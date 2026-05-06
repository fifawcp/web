"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { updateMemberRole } from "@/features/boards/api/client";
import { BoardRole } from "@/features/boards/types/board.types";
import { useApiError } from "@/shared/hooks/useApiError";

export function useUpdateMemberRole(boardId: string) {
  const router = useRouter();
  const t = useTranslations("boards.ranking");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const apiError = useApiError();

  const handleUpdateRole = async (userId: string, role: string) => {
    setUpdatingUserId(userId);
    apiError.clear();

    const res = await updateMemberRole(boardId, userId, { role: role as BoardRole });
    setUpdatingUserId(null);

    if (!res.success) {
      apiError.set(res.error);
      toast.error(res.error?.message || "Failed to update role");
      return;
    }

    toast.success(t("roleUpdated"), {
      description: t("roleUpdateSuccess"),
    });

    router.refresh();
  };

  return {
    handleUpdateRole,
    updatingUserId,
    apiError,
  };
}
