"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { ConfirmByTyping } from "@/shared/components/ConfirmByTyping";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { useAutoFocusUnlessMobile } from "@/shared/hooks/useAutoFocusUnlessMobile";
import { translateApiError } from "@/shared/lib/api/errors";

import { useDeleteBoard } from "../hooks/useBoardMutations";
import { BOARD_DIALOG_WIDTH } from "../lib/boardDialog";
import type { Board } from "../types/boards.types";

type Props = {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Owner-only board deletion. Requires typing the board name to confirm — deleting removes every
// competition and standing on the board.
export function DeleteBoardDialog({ board, open, onOpenChange }: Props) {
  const t = useTranslations("boards.manage.general");
  const tApiErrors = useTranslations("apiErrors");
  const router = useRouter();
  const remove = useDeleteBoard(board.id);
  const focus = useAutoFocusUnlessMobile();
  const [typed, setTyped] = useState("");

  async function handleDelete() {
    await remove.mutateAsync().then(
      () => {
        toast.success(t("delete.success"));
        onOpenChange(false);
        router.replace("/boards");
        router.refresh();
      },
      (error: Error) => toast.error(translateApiError(error, tApiErrors))
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped("");
        onOpenChange(next);
      }}
    >
      <DialogContent onOpenAutoFocus={focus.onOpenAutoFocus} className={BOARD_DIALOG_WIDTH}>
        <DialogHeader>
          <DialogTitle>{t("delete.confirm", { name: board.name })}</DialogTitle>
        </DialogHeader>
        <ConfirmByTyping
          inputId="delete-board-confirm"
          warning={t("delete.description")}
          label={t.rich("delete.typeToConfirm", { name: board.name, b: (chunks) => <span className="font-medium text-foreground">{chunks}</span> })}
          placeholder={board.name}
          value={typed}
          onChange={setTyped}
          autoFocus={focus.autoFocus}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setTyped("");
              onOpenChange(false);
            }}
            className="sm:min-w-24 sm:px-6"
          >
            {t("delete.cancel")}
          </Button>
          <Button variant="destructive" disabled={typed !== board.name || remove.isPending} onClick={handleDelete} className="sm:min-w-24 sm:px-6">
            {t("delete.cta")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
