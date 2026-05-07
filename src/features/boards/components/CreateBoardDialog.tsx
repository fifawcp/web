"use client";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { ErrorAlert } from "@/features/auth/components/ErrorAlert";
import { FieldMessageSlot } from "@/features/auth/components/FieldMessageSlot";
import { useCreateBoard } from "@/features/boards/hooks/useCreateBoard";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBoardDialog({ open, onOpenChange }: CreateBoardDialogProps) {
  const t = useTranslations("boards");
  const { form, apiError, onSubmit } = useCreateBoard(onOpenChange);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      apiError.clear();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-5 min-w-auto sm:min-w-100">
        <DialogHeader className="gap-0">
          <DialogTitle className="font-bold text-xl">{t("create.title")}</DialogTitle>
          <DialogDescription className="">{t("create.description")}</DialogDescription>
        </DialogHeader>
        <ErrorAlert message={apiError.message} />
        <form id="create-board-form" onSubmit={onSubmit} className="space-y-4">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor="board-name">{t("create.nameLabel")}</FieldLabel>
                  <Input {...field} id="board-name" aria-invalid={fieldState.invalid} placeholder={t("create.namePlaceholder")} />
                  <FieldMessageSlot>
                    {fieldState.invalid && fieldState.error?.message ? <FieldError errors={[{ message: t(fieldState.error.message) }]} /> : null}
                  </FieldMessageSlot>
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {t("create.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
