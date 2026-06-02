"use client";

import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { AvatarStack } from "@/shared/components/AvatarStack";
import { CopyButton } from "@/shared/components/CopyButton";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { canNativeShare, shareOrCopy } from "@/shared/lib/share";

import { boardMembersKey, fetchBoardMembers } from "../api/boards";
import type { Board } from "../types/boards.types";

import { BoardSquare } from "./BoardSquare";

type Props = {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Read client-only values without an SSR/hydration mismatch (server snapshot is the safe default).
const emptySubscribe = () => () => {};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{children}</span>;
}

export function InviteDialog({ board, open, onOpenChange }: Props) {
  const t = useTranslations("boards.invite");
  const tBoards = useTranslations("boards");
  const { data: session } = useSession();

  const origin = useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => ""
  );
  const shareable = useSyncExternalStore(emptySubscribe, canNativeShare, () => false);

  const membersQuery = useQuery({
    queryKey: boardMembersKey(board.id, { limit: 8 }),
    queryFn: () => fetchBoardMembers(board.id, { limit: 8 }),
    enabled: open,
    staleTime: 60_000,
  });

  const inviteUrl = board.join_code && origin ? `${origin}/boards/join/${board.join_code}` : "";
  const viewerName = [session?.user?.first_name, session?.user?.last_name].filter(Boolean).join(" ") || session?.user?.username || t("you");
  const othersCount = Math.max(0, board.member_count - 1);

  const handleShare = async () => {
    if (!inviteUrl) return;
    const result = await shareOrCopy({ url: inviteUrl, title: t("title", { name: board.name }), text: t("shareText", { name: board.name }) });
    if (result === "copied") toast.success(t("copiedLinkToast"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <BoardSquare board={board} className="size-10 rounded-lg text-xs shadow-sm ring-1 ring-foreground/10" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <DialogTitle className="truncate text-left text-base">{t("title", { name: board.name })}</DialogTitle>
              <span className="text-sm text-muted-foreground">
                {tBoards(`privacy.${board.privacy}`)} · {tBoards("members", { count: board.member_count })}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
          {membersQuery.data ? (
            <AvatarStack members={membersQuery.data.items} total={board.member_count} max={4} size="sm" tone="neutral" />
          ) : (
            <div className="flex">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="-ml-2 size-7 rounded-full ring-2 ring-background first:ml-0" />
              ))}
            </div>
          )}
          <span className="text-sm text-muted-foreground">{othersCount > 0 ? t("alreadyPlaying", { name: viewerName, count: othersCount }) : t("beFirst")}</span>
        </div>

        {inviteUrl ? (
          <div className="space-y-3">
            <FieldLabel>{t("link")}</FieldLabel>
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 py-2 pl-4 pr-2">
              <span className="truncate text-sm text-muted-foreground" title={inviteUrl}>
                {inviteUrl}
              </span>
              <CopyButton value={inviteUrl} variant="accent" iconOnly label={t("copy")} copiedLabel={t("copied")} onCopied={() => toast.success(t("copiedLinkToast"))} />
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <FieldLabel>{tBoards("manage.general.joinCode")}</FieldLabel>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 py-2 pl-4 pr-2">
            <span aria-label={board.join_code ?? ""} className="truncate font-mono text-lg font-semibold tracking-[0.2em] text-foreground">
              {board.join_code ?? "—"}
            </span>
            {board.join_code ? (
              <CopyButton
                value={board.join_code}
                variant="accent"
                iconOnly
                label={t("copy")}
                copiedLabel={t("copied")}
                onCopied={() => toast.success(t("copiedToast"))}
              />
            ) : null}
          </div>
        </div>

        <Button type="button" className="w-full gap-2 bg-page-accent text-white hover:bg-page-accent/90" onClick={handleShare} disabled={!inviteUrl}>
          <Share2 className="size-4" aria-hidden />
          {shareable ? t("shareInvite") : t("copyLink")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
