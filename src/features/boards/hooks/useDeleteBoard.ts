"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { deleteBoard } from "@/features/boards/api/client";
import { removeLastVisitedBoardId } from "@/features/boards/utils/boardStorage";
import { useApiError } from "@/shared/hooks/useApiError";

export function useDeleteBoard(boardId: string) {
  const router = useRouter();
  const apiError = useApiError();
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations("boards.delete");
  const tErrors = useTranslations("boards.errors");

  const handleDelete = async () => {
    apiError.clear();
    setIsDeleting(true);

    const res = await deleteBoard(boardId);
    if (!res.success) {
      apiError.set(res.error);
      const errorMessage = res.error?.code && tErrors(res.error.code) !== res.error.code ? tErrors(res.error.code) : res.error?.message || t("errorDescription");

      toast.error(t("error"), {
        description: errorMessage,
      });
      setIsDeleting(false);
      return;
    }

    toast.success(t("success"), {
      description: t("successDescription"),
    });

    removeLastVisitedBoardId();

    router.push("/boards");
  };

  return {
    apiError,
    isDeleting,
    handleDelete,
  };
}
