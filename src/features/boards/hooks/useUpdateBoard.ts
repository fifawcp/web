"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateBoard } from "@/features/boards/api/client";
import { updateBoardSchema, type UpdateBoardFormData } from "@/features/boards/schemas/board.schema";
import { useApiError } from "@/shared/hooks/useApiError";

export function useUpdateBoard(boardId: string, currentName: string, onSuccess?: () => void) {
  const apiError = useApiError();
  const tErrors = useTranslations("boards.errors");
  const t = useTranslations("boards.update");

  const form = useForm<UpdateBoardFormData>({
    resolver: zodResolver(updateBoardSchema),
    defaultValues: { name: currentName },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    apiError.clear();

    const res = await updateBoard(boardId, data);
    if (!res.success) {
      apiError.set(res.error);
      const errorMessage = res.error?.code && tErrors(res.error.code) !== res.error.code ? tErrors(res.error.code) : res.error?.message || t("errorDescription");

      toast.error(t("error"), {
        description: errorMessage,
      });

      return;
    }

    toast.success(t("success"), {
      description: t("successDescription"),
    });

    onSuccess?.();
  });

  return {
    form,
    apiError,
    onSubmit,
  };
}
