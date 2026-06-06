"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { ConfirmByTyping } from "@/shared/components/ConfirmByTyping";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { useAutoFocusUnlessMobile } from "@/shared/hooks/useAutoFocusUnlessMobile";
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
  const focus = useAutoFocusUnlessMobile();
  const [typed, setTyped] = useState("");

  const name = competitionName(competition.name);

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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped("");
        onOpenChange(next);
      }}
    >
      <DialogContent onOpenAutoFocus={focus.onOpenAutoFocus}>
        <DialogHeader>
          <DialogTitle>{t("title", { name })}</DialogTitle>
        </DialogHeader>
        <ConfirmByTyping
          inputId="delete-competition-confirm"
          warning={t("description", { name })}
          label={t.rich("typeToConfirm", { name, b: (chunks) => <span className="font-medium text-foreground">{chunks}</span> })}
          placeholder={name}
          value={typed}
          onChange={setTyped}
          autoFocus={focus.autoFocus}
        />
        <DialogFooter className="flex-col sm:flex-row-reverse sm:justify-start">
          <Button variant="destructive" onClick={handleConfirm} disabled={typed !== name || mutation.isPending}>
            {t("confirm")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setTyped("");
              onOpenChange(false);
            }}
            disabled={mutation.isPending}
          >
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
