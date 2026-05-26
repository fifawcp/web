"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useAutoFocusUnlessMobile } from "@/shared/hooks/useAutoFocusUnlessMobile";
import { translateApiError } from "@/shared/lib/api/errors";

import { useCreateBoard } from "../hooks/useBoardMutations";
import { rememberLastBoard } from "../lib/lastBoardCookie";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NAME_MAX = 20;

export function CreateBoardDialog({ open, onOpenChange }: Props) {
  const t = useTranslations("boards.create");
  const tApiErrors = useTranslations("apiErrors");
  const router = useRouter();
  const mutation = useCreateBoard();

  const [name, setName] = useState("");
  const focus = useAutoFocusUnlessMobile();

  const trimmed = name.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= NAME_MAX;
  const isPending = mutation.isPending;

  function reset() {
    setName("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid || isPending) return;

    const board = await mutation.mutateAsync({ name: trimmed }).catch((error: Error) => {
      toast.error(translateApiError(error, tApiErrors));
      return null;
    });
    if (!board) return;

    toast.success(t("success"));
    rememberLastBoard(board.id);
    reset();
    onOpenChange(false);
    router.push(`/boards/${board.id}`);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent onOpenAutoFocus={focus.onOpenAutoFocus}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="board-name">{t("name")}</FieldLabel>
            <Input
              id="board-name"
              autoFocus={focus.autoFocus}
              maxLength={NAME_MAX}
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="focus-visible:border-page-accent-strong focus-visible:ring-page-accent-strong/30"
              required
            />
            <FieldDescription>
              {trimmed.length}/{NAME_MAX}
            </FieldDescription>
          </Field>
          <DialogFooter className="flex-col sm:flex-row-reverse sm:justify-start">
            <Button type="submit" disabled={!isValid || isPending} className="bg-page-accent text-white hover:bg-page-accent/90">
              {t("submit")}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              {t("cancel")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
