"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createBoard } from "@/features/boards/api/client";
import { createBoardSchema, type CreateBoardFormData } from "@/features/boards/schemas/board.schema";
import { useApiError } from "@/shared/hooks/useApiError";

export function useCreateBoard() {
  const router = useRouter();
  const apiError = useApiError();
  const [open, setOpen] = useState(false);
  const t = useTranslations("boards.create");
  const tErrors = useTranslations("boards.errors");

  const form = useForm<CreateBoardFormData>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: { name: "" },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (data) => {
    apiError.clear();

    const res = await createBoard(data);
    if (!res.success) {
      apiError.set(res.error);
      const errorMessage = res.error?.code && tErrors(res.error.code) !== res.error.code ? tErrors(res.error.code) : res.error?.message || t("errorDescription");

      toast.error(t("error"), {
        description: errorMessage,
      });
      return;
    }

    const boardId = res.data?.id;

    toast.success(t("success"), {
      description: t("successDescription"),
    });
    form.reset();
    setOpen(false);

    setTimeout(() => {
      if (boardId) {
        router.push(`/boards/${boardId}`);
      } else {
        router.refresh();
      }
    }, 100);
  });

  return {
    form,
    apiError,
    onSubmit,
    open,
    setOpen,
  };
}
