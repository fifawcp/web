"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { translateApiError } from "@/shared/lib/api/errors";

import { useCompetitionName } from "../hooks/useCompetitionName";
import { useDeleteCompetition } from "../hooks/useDeleteCompetition";
import type { Competition } from "../types/competitions.types";

type Props = {
  boardId: number;
  competition: Competition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteCompetitionDialog({ boardId, competition, open, onOpenChange }: Props) {
  const t = useTranslations("competitions.delete");
  const tApiErrors = useTranslations("apiErrors");
  const competitionName = useCompetitionName();
  const router = useRouter();
  const mutation = useDeleteCompetition(boardId);

  async function handleConfirm() {
    await mutation.mutateAsync(competition.id).then(
      () => {
        toast.success(t("success"));
        onOpenChange(false);
        router.refresh();
      },
      (error: Error) => toast.error(translateApiError(error, tApiErrors))
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description", { name: competitionName(competition.name) })}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row-reverse sm:justify-start">
          <Button variant="destructive" onClick={handleConfirm} disabled={mutation.isPending}>
            {t("confirm")}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
