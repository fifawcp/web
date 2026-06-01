"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";
import { useAutoFocusUnlessMobile } from "@/shared/hooks/useAutoFocusUnlessMobile";
import { translateApiError } from "@/shared/lib/api/errors";

import { useJoinBoard } from "../hooks/useBoardMutations";
import { BOARD_DIALOG_WIDTH } from "../lib/boardDialog";
import { rememberLastBoard } from "../lib/lastBoardCookie";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CODE_LENGTH = 8;
// Desktop matches the login OTP slot dimensions (h-14 w-13 text-xl); mobile keeps the
// default size-9 so all 8 slots fit a narrow viewport.
const SLOT_CLASS = "uppercase data-[active=true]:border-page-accent-strong data-[active=true]:ring-page-accent-strong/40 md:h-14 md:w-13 md:text-xl";

export function JoinBoardDialog({ open, onOpenChange }: Props) {
  const t = useTranslations("boards.join");
  const tApiErrors = useTranslations("apiErrors");
  const router = useRouter();
  const mutation = useJoinBoard();
  const [code, setCode] = useState("");
  const focus = useAutoFocusUnlessMobile();

  const normalized = code.trim().toUpperCase();
  const isValid = normalized.length === CODE_LENGTH;
  const isPending = mutation.isPending;

  function reset() {
    setCode("");
  }

  async function submit() {
    if (!isValid || isPending) return;

    const res = await mutation.mutateAsync({ join_code: normalized }).catch((error: Error) => {
      toast.error(translateApiError(error, tApiErrors));
      return null;
    });
    if (!res) return;

    toast.success(t("success"));
    rememberLastBoard(res.board_id);
    reset();
    onOpenChange(false);
    router.push(`/boards/${res.board_id}`);
    router.refresh();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void submit();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent onOpenAutoFocus={focus.onOpenAutoFocus} className={BOARD_DIALOG_WIDTH}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <Field className="items-center">
            <FieldLabel htmlFor="join-code" className="text-center">
              {t("code")}
            </FieldLabel>
            <div className="flex w-full justify-center">
              <InputOTP
                id="join-code"
                maxLength={CODE_LENGTH}
                value={code}
                onChange={setCode}
                onComplete={() => void submit()}
                pattern="^[A-Za-z0-9]+$"
                autoFocus={focus.autoFocus}
                disabled={isPending}
              >
                <InputOTPGroup>
                  {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} className={SLOT_CLASS} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </Field>
          <DialogFooter className="w-full flex-col sm:flex-row-reverse sm:justify-start">
            <Button type="submit" disabled={!isValid || isPending} className="bg-page-accent text-white hover:bg-page-accent/90 sm:min-w-24 sm:px-6">
              {t("submit")}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="sm:min-w-24 sm:px-6">
              {t("cancel")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
