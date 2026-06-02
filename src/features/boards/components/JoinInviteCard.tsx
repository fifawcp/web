"use client";

import { useState } from "react";
import { ArrowRight, Globe2, Link2Off, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { Link, useRouter } from "@/i18n/navigation";
import { AvatarStack } from "@/shared/components/AvatarStack";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { translateApiError } from "@/shared/lib/api/errors";
import { cn } from "@/shared/lib/utils";

import { useJoinBoard } from "../hooks/useBoardMutations";
import { rememberLastBoard } from "../lib/lastBoardCookie";
import type { BoardPreview } from "../types/boards.types";

import { BoardSquare } from "./BoardSquare";

type Props = {
  preview: BoardPreview | null;
  code: string;
  isAuthenticated: boolean;
};

// fill-mode-both holds the pre-animation state so staggered delays don't flash.
const reveal = "animate-in fade-in-0 slide-in-from-bottom-2 duration-500 [animation-fill-mode:both]";

export function JoinInviteCard({ preview, code, isAuthenticated }: Props) {
  if (!preview) return <InvalidInvite />;
  return <ValidInvite preview={preview} code={code} isAuthenticated={isAuthenticated} />;
}

function Shell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--header-height))] w-full max-w-md items-center justify-center px-4 py-8">
      <Card className="w-full gap-0 bg-card py-0">
        <div className="flex flex-col items-center gap-5 px-6 pt-9 pb-7 text-center">{children}</div>
        {footer ? <div className="border-t border-border/60 bg-muted/40 px-6 py-3.5 text-center">{footer}</div> : null}
      </Card>
    </div>
  );
}

function ValidInvite({ preview, code, isAuthenticated }: { preview: BoardPreview; code: string; isAuthenticated: boolean }) {
  const t = useTranslations("boards.inviteLanding");
  const tBoards = useTranslations("boards");
  const tApiErrors = useTranslations("apiErrors");
  const router = useRouter();
  const mutation = useJoinBoard();
  const [joined, setJoined] = useState(false);
  const isPending = mutation.isPending || joined;

  const isGlobal = preview.privacy === "global";
  const PrivacyIcon = preview.privacy === "public" || isGlobal ? Globe2 : Lock;

  async function handleJoin() {
    if (isPending) return;

    if (!isAuthenticated) {
      useAuthStore.getState().setCallbackUrl(`/boards/join/${code}`);
      router.push("/login");
      return;
    }

    const res = await mutation.mutateAsync({ join_code: code.trim().toUpperCase() }).catch((error: Error) => {
      toast.error(translateApiError(error, tApiErrors));
      return null;
    });
    if (!res) return;

    setJoined(true);
    toast.success(t("success"));
    rememberLastBoard(res.board_id);
    router.push(`/boards/${res.board_id}`);
    router.refresh();
  }

  return (
    <Shell
      footer={
        <p className="text-xs text-muted-foreground">
          {t("codeFooter")} <span className="font-mono font-medium tracking-widest text-foreground">{code.toUpperCase()}</span>
        </p>
      }
    >
      <p className={cn("text-lg font-semibold text-foreground", reveal)}>{t("invitedYou")}</p>

      <span className={reveal} style={{ animationDelay: "80ms" }}>
        <BoardSquare board={preview} className="size-16 rounded-xl text-xl shadow-md ring-1 ring-foreground/10" />
      </span>

      <div className={cn("flex flex-col items-center gap-2.5", reveal)} style={{ animationDelay: "140ms" }}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <PrivacyIcon className="size-3.5" aria-hidden />
          {tBoards(`privacy.${preview.privacy}`)}
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{preview.name}</h1>
      </div>

      {preview.member_count > 0 ? (
        <div className={cn("flex w-full items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3", reveal)} style={{ animationDelay: "200ms" }}>
          <AvatarStack members={preview.members} total={preview.member_count} max={4} size="sm" tone="neutral" />
          <span className="text-left text-sm text-muted-foreground">{t("players", { count: preview.member_count })}</span>
        </div>
      ) : null}

      <div className={cn("flex w-full flex-col gap-2", reveal)} style={{ animationDelay: "260ms" }}>
        <Button className="group w-full gap-2" onClick={handleJoin} disabled={isPending}>
          {t("join")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href={isAuthenticated ? "/boards" : "/"}>{t("cancel")}</Link>
        </Button>
      </div>
    </Shell>
  );
}

function InvalidInvite() {
  const t = useTranslations("boards.inviteLanding");

  return (
    <Shell>
      <div className="grid size-12 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Link2Off className="size-6" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold text-foreground">{t("invalidTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("invalidDescription")}</p>
      <Button asChild variant="outline" className="w-full">
        <Link href="/boards">{t("invalidCta")}</Link>
      </Button>
    </Shell>
  );
}
