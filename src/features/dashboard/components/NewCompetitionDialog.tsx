"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import type { BoardListItem } from "@/features/boards/types/boards.types";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";

const ROW_CLASS = "-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted dark:hover:bg-muted";

type Props = {
  // Boards the viewer can create a competition in (admin/owner, non-global).
  boards: BoardListItem[];
};

// "New match competition" trigger + board picker. The actual create wizard lives on
// the board page, so picking a board routes there with ?dialog=new-competition.
export function NewCompetitionDialog({ boards }: Props) {
  const t = useTranslations("dashboard.quickActions");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const select = (id: number) => {
    setOpen(false);
    router.push(`/boards/${id}?dialog=new-competition`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={ROW_CLASS}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
            <Plus className="size-4" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{t("newCompetition")}</span>
            <span className="truncate text-xs text-muted-foreground">{t("newCompetitionSub")}</span>
          </span>
          <ChevronRight className="-mr-1.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        {boards.length > 0 ? (
          <div className="flex flex-col">
            {boards.map((board) => (
              <button key={board.id} type="button" onClick={() => select(board.id)} className={ROW_CLASS}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  {board.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-semibold">{board.name}</span>
                  <span className="truncate text-xs capitalize text-muted-foreground">{board.privacy}</span>
                </span>
                <ChevronRight className="-mr-1.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-4 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{t("dialog.emptyTitle")}</span>
              <span className="text-xs text-muted-foreground">{t("dialog.emptyDescription")}</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild className="bg-page-accent text-white hover:bg-page-accent/90">
                <Link href="/boards?dialog=create" onClick={() => setOpen(false)}>
                  {t("dialog.createBoard")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/boards?dialog=join" onClick={() => setOpen(false)}>
                  {t("joinBoard")}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { ROW_CLASS as QUICK_ACTION_ROW_CLASS };
