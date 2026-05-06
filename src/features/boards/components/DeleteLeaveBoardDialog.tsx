"use client";

import { useTranslations } from "next-intl";

import { useDeleteBoard } from "@/features/boards/hooks/useDeleteBoard";
import { useLeaveBoard } from "@/features/boards/hooks/useLeaveBoard";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";

interface DeleteLeaveBoardDialogProps {
  boardId: string;
  boardName: string;
  isOwner: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLeaveBoardDialog({ boardId, boardName, isOwner, open, onOpenChange }: DeleteLeaveBoardDialogProps) {
  const t = useTranslations("boards");

  const { handleDelete, isDeleting } = useDeleteBoard(boardId);
  const { handleLeave, isLeaving } = useLeaveBoard(boardId);

  const isProcessing = isDeleting || isLeaving;
  const actionKey = isOwner ? "delete" : "leave";

  const handleConfirm = async () => {
    if (isOwner) {
      await handleDelete();
    } else {
      await handleLeave();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 min-w-auto md:min-w-100">
        <DialogHeader className="gap-2">
          <DialogTitle className="font-bold text-xl">{t(`${actionKey}.title`)}</DialogTitle>
          <DialogDescription className="">{t(`${actionKey}.description`, { boardName })}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            {t(`${actionKey}.cancel`)}
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? t(`${actionKey}.processing`) : t(`${actionKey}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
