"use client";

import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { ErrorAlert } from "@/features/auth/components/ErrorAlert";
import { FieldMessageSlot } from "@/features/auth/components/FieldMessageSlot";
import { useJoinBoard } from "@/features/boards/hooks/useJoinBoard";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";

export function JoinBoardDialog() {
  const t = useTranslations("boards");
  const { form, apiError, onSubmit, open, setOpen } = useJoinBoard();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      apiError.clear();
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="bg-background text-foreground h-auto p-1.5 sm:py-2 sm:px-3 text-sm">
          <UserPlus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("join.trigger")}</span>
          <span className="text-xs sm:hidden">{t("join.join")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-5 min-w-auto sm:min-w-120">
        <DialogHeader className="gap-0">
          <DialogTitle className="font-bold text-xl">{t("join.title")}</DialogTitle>
          <DialogDescription className="">{t("join.description")}</DialogDescription>
        </DialogHeader>
        <ErrorAlert message={apiError.message} />
        <form id="join-board-form" onSubmit={onSubmit} className="space-y-4">
          <FieldGroup>
            <Controller
              name="join_code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor="join-code">{t("join.codeLabel")}</FieldLabel>
                  <InputOTP
                    {...field}
                    id="join-code"
                    maxLength={8}
                    aria-invalid={fieldState.invalid}
                    containerClassName="justify-center"
                    onChange={(value) => field.onChange(value.toUpperCase())}
                    value={field.value.toUpperCase()}
                  >
                    <InputOTPGroup className="otp-group-custom">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldMessageSlot>
                    {fieldState.invalid && fieldState.error?.message ? <FieldError errors={[{ message: t(fieldState.error.message) }]} /> : null}
                  </FieldMessageSlot>
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {t("join.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
