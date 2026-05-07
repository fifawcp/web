"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { joinBoard } from "@/features/boards/api/client";
import { joinBoardSchema, type JoinBoardFormData } from "@/features/boards/schemas/board.schema";
import { useApiError } from "@/shared/hooks/useApiError";

export function useJoinBoard(setOpen: (open: boolean) => void) {
  const router = useRouter();
  const apiError = useApiError();
  const t = useTranslations("boards.join");
  const tErrors = useTranslations("boards.errors");

  const form = useForm<JoinBoardFormData>({
    resolver: zodResolver(joinBoardSchema),
    defaultValues: {
      join_code: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    apiError.clear();

    const res = await joinBoard(data);
    if (!res.success) {
      apiError.set(res.error);
      const errorMessage = res.error?.code && tErrors(res.error.code) !== res.error.code ? tErrors(res.error.code) : res.error?.message || t("errorDescription");

      toast.error(t("error"), {
        description: errorMessage,
      });
      return;
    }

    const boardId = res.data?.board_id;

    toast.success(t("success"), {
      description: t("successDescription"),
    });
    form.reset();
    setOpen(false);

    if (boardId) {
      router.push(`/boards/${boardId}`);
    } else {
      router.refresh();
    }
  });

  return {
    form,
    apiError,
    onSubmit,
  };
}
