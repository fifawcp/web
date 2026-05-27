"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { translateApiError } from "@/shared/lib/api/errors";

import { useLeaveBoard } from "../hooks/useBoardMutations";
import type { Board } from "../types/boards.types";

type Props = {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LeaveBoardDialog({ board, open, onOpenChange }: Props) {
  const t = useTranslations("boards.manage.danger");
  const tApiErrors = useTranslations("apiErrors");
  const router = useRouter();
  const leave = useLeaveBoard(board.id);

  async function handleLeave() {
    await leave.mutateAsync().then(
      () => {
        toast.success(t("leave.success"));
        onOpenChange(false);
        router.replace("/boards");
        router.refresh();
      },
      (error: Error) => toast.error(translateApiError(error, tApiErrors))
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("leave.confirm")}</DialogTitle>
          <DialogDescription>{t("leave.description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={leave.isPending}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleLeave} disabled={leave.isPending}>
            {t("leave.cta")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
