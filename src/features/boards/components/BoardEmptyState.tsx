"use client";

import { useState } from "react";
import { Plus, Ticket, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

import { useBoardDialogParam } from "../hooks/useBoardDialogParam";

import { CreateBoardDialog } from "./CreateBoardDialog";
import { JoinBoardDialog } from "./JoinBoardDialog";

export function BoardEmptyState() {
  const t = useTranslations("boards.empty");
  const dialogParam = useBoardDialogParam();
  const [createOpen, setCreateOpen] = useState(dialogParam === "create");
  const [joinOpen, setJoinOpen] = useState(dialogParam === "join");

  return (
    <div className="container flex min-h-[calc(100dvh-var(--header-height))] items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-5 px-6 py-10">
          <div className="grid size-14 place-items-center rounded-lg bg-muted">
            <Users className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-xl font-semibold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="size-4" aria-hidden /> {t("create")}
            </Button>
            <Button variant="outline" onClick={() => setJoinOpen(true)} className="gap-1.5">
              <Ticket className="size-4" aria-hidden /> {t("join")}
            </Button>
          </div>
        </CardContent>
      </Card>
      <CreateBoardDialog open={createOpen} onOpenChange={setCreateOpen} />
      <JoinBoardDialog open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
}
