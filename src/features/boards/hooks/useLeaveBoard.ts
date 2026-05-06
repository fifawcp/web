"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { leaveBoard } from "@/features/boards/api/client";
import { removeLastVisitedBoardId } from "@/features/boards/utils/boardStorage";
import { useApiError } from "@/shared/hooks/useApiError";

export function useLeaveBoard(boardId: string) {
  const router = useRouter();
  const apiError = useApiError();
  const [isLeaving, setIsLeaving] = useState(false);
  const t = useTranslations("boards.leave");
  const tErrors = useTranslations("boards.errors");

  const handleLeave = async () => {
    apiError.clear();
    setIsLeaving(true);

    const res = await leaveBoard(boardId);
    if (!res.success) {
      apiError.set(res.error);
      const errorMessage = res.error?.code && tErrors(res.error.code) !== res.error.code ? tErrors(res.error.code) : res.error?.message || t("errorDescription");

      toast.error(t("error"), {
        description: errorMessage,
      });
      setIsLeaving(false);
      return;
    }

    toast.success(t("success"), {
      description: t("successDescription"),
    });

    removeLastVisitedBoardId();

    setTimeout(() => {
      router.push("/boards");
    }, 100);
  };

  return {
    apiError,
    isLeaving,
    handleLeave,
  };
}
