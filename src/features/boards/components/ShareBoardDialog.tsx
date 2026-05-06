"use client";

import { Copy, RefreshCw, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { BoardDetails } from "@/features/boards/types/board.types";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";

import { useShareBoard } from "../hooks/useShareBoard";

interface ShareBoardDialogProps {
  board: BoardDetails;
}

export function ShareBoardDialog({ board }: ShareBoardDialogProps) {
  const { open, setOpen, copyCode, copyLink, handleRegenerate, isRegenerating, copied, linkCopied, joinCode, shareLink, isAdminOrOwner } = useShareBoard({ board });
  const t = useTranslations("boards");
  const tShare = useTranslations("boards.share");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          {t("subheader.inviteFriends")}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-5 min-w-auto md:min-w-100">
        <DialogHeader className="gap-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{tShare("inviteToPool")}</p>
          <DialogTitle className="font-bold text-xl">{board.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col bg-muted rounded-lg p-4 gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider text-center">{tShare("joinCode")}</p>

            <p className="text-4xl text-center font-bold tracking-widest font-mono">{joinCode}</p>

            <div className="flex justify-center items-center gap-1">
              <Button variant="outline" size="xs" onClick={copyCode}>
                <Copy className="h-3 w-3" />
                {copied ? tShare("copied") : tShare("copyCode")}
              </Button>
              {isAdminOrOwner && (
                <Button variant="ghost" size="xs" onClick={handleRegenerate} disabled={isRegenerating}>
                  <RefreshCw className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`} />
                  {tShare("regenerate")}
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-2xs text-muted-foreground uppercase tracking-wider">{tShare("orShareLink")}</p>
            <div className="flex gap-2 bg-muted items-center rounded-lg p-1">
              <Input value={shareLink} readOnly className="font-mono text-sm border-0 shadow-none" />
              <Button variant="outline" size="xs" onClick={copyLink}>
                {linkCopied ? tShare("copied") : tShare("copyLink")}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="p-2">
          <p className="text-xs text-muted-foreground text-center w-full">{tShare("shareHint")}</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
