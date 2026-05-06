"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { ErrorAlert } from "@/features/auth/components/ErrorAlert";
import { FieldMessageSlot } from "@/features/auth/components/FieldMessageSlot";
import { useUpdateBoard } from "@/features/boards/hooks/useUpdateBoard";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

interface UpdateBoardDialogProps {
  boardId: string;
  boardName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateBoardDialog({ boardId, boardName, open, onOpenChange }: UpdateBoardDialogProps) {
  const t = useTranslations("boards");
  const router = useRouter();

  const { form, apiError, onSubmit } = useUpdateBoard(boardId, boardName, () => {
    onOpenChange(false);
    router.refresh();
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      apiError.clear();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-5 min-w-auto md:min-w-120">
        <DialogHeader className="gap-0">
          <DialogTitle className="font-bold text-xl">{t("update.title")}</DialogTitle>
          <DialogDescription>{t("update.description")}</DialogDescription>
        </DialogHeader>
        <ErrorAlert message={apiError.message} />
        <form id="update-board-form" onSubmit={onSubmit} className="space-y-4">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor="board-name">{t("update.nameLabel")}</FieldLabel>
                  <Input {...field} id="board-name" placeholder={t("update.namePlaceholder")} aria-invalid={fieldState.invalid} />
                  <FieldMessageSlot>
                    {fieldState.invalid && fieldState.error?.message ? <FieldError errors={[{ message: t(fieldState.error.message) }]} /> : null}
                  </FieldMessageSlot>
                </Field>
              )}
            />
          </FieldGroup>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={form.formState.isSubmitting}>
              {t("update.cancel")}
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t("update.processing") : t("update.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
