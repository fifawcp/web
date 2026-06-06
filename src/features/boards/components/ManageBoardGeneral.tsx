"use client";

import { useState } from "react";
import { Check, type LucideIcon, Link2, RefreshCw, SquarePen, Trash2, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { CopyButton } from "@/shared/components/CopyButton";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { useAutoFocusUnlessMobile } from "@/shared/hooks/useAutoFocusUnlessMobile";
import { cn } from "@/shared/lib/utils";

import { useBoardActionError } from "../hooks/useBoardActionError";
import { useDeleteBoard, useRegenerateJoinCode, useRenameBoard } from "../hooks/useBoardMutations";
import { BOARD_DIALOG_WIDTH } from "../lib/boardDialog";
import { canDeleteBoard, canManageBoard, isGlobalBoard } from "../lib/boardRole";
import type { Board } from "../types/boards.types";

const NAME_MAX = 20;

type Props = {
  board: Board;
  onClose: () => void;
  onPermissionLost: () => void;
};

export function ManageBoardGeneral({ board, onClose, onPermissionLost }: Props) {
  const t = useTranslations("boards.manage.general");
  const tInvite = useTranslations("boards.invite");
  const reportError = useBoardActionError(onPermissionLost);
  const router = useRouter();
  const rename = useRenameBoard(board.id);
  const regenerate = useRegenerateJoinCode(board.id);
  const remove = useDeleteBoard(board.id);
  const canManage = canManageBoard(board.viewer.role) && !isGlobalBoard(board);
  const canDelete = canDeleteBoard(board.viewer.role) && !isGlobalBoard(board);

  const [name, setName] = useState(board.name);
  const [lastBoardName, setLastBoardName] = useState(board.name);
  if (lastBoardName !== board.name) {
    setLastBoardName(board.name);
    setName(board.name);
  }

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTyped, setDeleteTyped] = useState("");
  const deleteFocus = useAutoFocusUnlessMobile();

  const trimmed = name.trim();
  const isDirty = trimmed !== board.name && trimmed.length > 0;

  async function handleRename(event: React.FormEvent) {
    event.preventDefault();
    if (!isDirty) return;
    await rename.mutateAsync({ name: trimmed }).then(() => {
      toast.success(t("renameSuccess"));
      router.refresh();
    }, reportError);
  }

  async function handleRegenerate() {
    setConfirmOpen(false);
    await regenerate.mutateAsync().then(() => {
      toast.success(t("regenerateSuccess"));
      router.refresh();
    }, reportError);
  }

  async function handleDelete() {
    await remove.mutateAsync().then(() => {
      toast.success(t("delete.success"));
      setConfirmDelete(false);
      onClose();
      router.replace("/boards");
      router.refresh();
    }, reportError);
  }

  return (
    <div className="flex flex-col gap-3">
      <SettingCard>
        <SectionHeader icon={SquarePen} title={t("name")} description={t("nameSubtitle")} />
        <form onSubmit={handleRename} className="flex flex-col gap-2.5">
          <Input id="manage-name" value={name} maxLength={NAME_MAX} onChange={(event) => setName(event.target.value)} disabled={!canManage} aria-label={t("name")} />
          <span className="self-end text-2xs text-muted-foreground tabular-nums">
            {trimmed.length}/{NAME_MAX} {t("characters")}
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={!canManage || !isDirty || rename.isPending}
            className="w-full gap-1.5 bg-page-accent text-white hover:bg-page-accent/90"
          >
            <Check className="size-3.5" aria-hidden />
            {t("save")}
          </Button>
        </form>
      </SettingCard>

      {board.join_code ? (
        <SettingCard>
          <SectionHeader icon={Link2} title={t("joinCode")} description={t("joinCodeSubtitle")} />
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-page-accent/20 bg-page-accent-soft px-4 py-3 font-mono text-base tracking-widest text-page-accent-strong">
            <span className="truncate">{board.join_code}</span>
            <CopyButton value={board.join_code} label={tInvite("copy")} copiedLabel={tInvite("copied")} iconOnly onCopied={() => toast.success(tInvite("copiedToast"))} />
          </div>
          {canManage ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => setConfirmOpen(true)} disabled={regenerate.isPending} className="w-full gap-1.5">
                <RefreshCw className="size-3.5" aria-hidden />
                {t("regenerate")}
              </Button>
              <p className="text-2xs leading-snug text-muted-foreground">{t("regenerateWarning")}</p>
            </>
          ) : null}
        </SettingCard>
      ) : null}

      {canDelete ? (
        <SettingCard tone="danger">
          <SectionHeader icon={TriangleAlert} title={t("dangerZone")} description={t("delete.description")} tone="danger" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="w-full gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5" aria-hidden />
            {t("delete.cta")}
          </Button>
        </SettingCard>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className={BOARD_DIALOG_WIDTH}>
          <DialogHeader>
            <DialogTitle>{t("regenerateConfirm")}</DialogTitle>
            <DialogDescription>{t("regenerateWarning")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="sm:min-w-24 sm:px-6">
              {t("cancel")}
            </Button>
            <Button onClick={handleRegenerate} disabled={regenerate.isPending} className="bg-page-accent text-white hover:bg-page-accent/90 sm:min-w-24 sm:px-6">
              {t("regenerate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDelete}
        onOpenChange={(next) => {
          if (!next) setDeleteTyped("");
          setConfirmDelete(next);
        }}
      >
        <DialogContent onOpenAutoFocus={deleteFocus.onOpenAutoFocus} className={BOARD_DIALOG_WIDTH}>
          <DialogHeader>
            <DialogTitle>{t("delete.confirm", { name: board.name })}</DialogTitle>
            <DialogDescription>{t("delete.confirmDescription")}</DialogDescription>
          </DialogHeader>
          <Input value={deleteTyped} onChange={(event) => setDeleteTyped(event.target.value)} autoFocus={deleteFocus.autoFocus} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)} className="sm:min-w-24 sm:px-6">
              {t("delete.cancel")}
            </Button>
            <Button variant="destructive" disabled={deleteTyped !== board.name || remove.isPending} onClick={handleDelete} className="sm:min-w-24 sm:px-6">
              {t("delete.cta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Each settings action lives in its own card so it reads as a self-contained unit.
// The danger zone tints its border to signal the destructive region without shouting.
function SettingCard({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "danger" }) {
  return (
    <section className={cn("flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs", tone === "danger" ? "border-destructive/30" : "border-foreground/10")}>
      {children}
    </section>
  );
}

// Icon + title + one-line description, atop each card.
function SectionHeader({ icon: Icon, title, description, tone = "default" }: { icon: LucideIcon; title: string; description: string; tone?: "default" | "danger" }) {
  const isDanger = tone === "danger";
  return (
    <div className="flex items-start gap-3">
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", isDanger ? "bg-destructive/10 text-destructive" : "bg-muted text-page-accent-strong")}>
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
        <h3 className={cn("text-sm font-semibold leading-none", isDanger && "text-destructive")}>{title}</h3>
        <p className="text-2xs leading-snug text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
