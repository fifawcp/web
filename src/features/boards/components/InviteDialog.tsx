"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { CopyButton } from "@/shared/components/CopyButton";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";

import { BOARD_DIALOG_WIDTH } from "../lib/boardDialog";
import type { Board } from "../types/boards.types";

type Props = {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InviteDialog({ board, open, onOpenChange }: Props) {
  const t = useTranslations("boards.invite");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={BOARD_DIALOG_WIDTH}>
        <DialogHeader>
          <DialogTitle>{t("title", { name: board.name })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-page-accent/20 bg-page-accent-soft px-4 py-3 font-mono text-lg tracking-widest text-page-accent-strong">
          <span aria-label={board.join_code ?? ""}>{board.join_code ?? "—"}</span>
          {board.join_code ? <CopyButton value={board.join_code} label={t("copy")} copiedLabel={t("copied")} onCopied={() => toast.success(t("copiedToast"))} /> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
