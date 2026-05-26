"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Crown, Search, ShieldOff, ShieldUser, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAutoFocusUnlessMobile } from "@/shared/hooks/useAutoFocusUnlessMobile";
import { useDebounce } from "@/shared/hooks/useDebounce";

import { BOARD_MEMBERS_PAGE_SIZE } from "../api/boards";
import { useBoardActionError } from "../hooks/useBoardActionError";
import { useBoardMembers, useRemoveMember, useTransferOwnership, useUpdateMemberRole } from "../hooks/useBoardMembers";
import { canManageBoard } from "../lib/boardRole";
import type { Board, BoardMember } from "../types/boards.types";

import { RoleChip } from "./RoleChip";

type Props = {
  board: Board;
  currentUserId: string;
  enabled: boolean;
  onPermissionLost: () => void;
};

export function ManageBoardMembers({ board, currentUserId, enabled, onPermissionLost }: Props) {
  const t = useTranslations("boards.manage.members");
  const tBoards = useTranslations("boards");
  const reportError = useBoardActionError(onPermissionLost);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const [page, setPage] = useState(1);

  // Reset to page 1 when the search changes — adjust-during-render avoids an effect.
  const [lastSearch, setLastSearch] = useState(debouncedSearch);
  if (lastSearch !== debouncedSearch) {
    setLastSearch(debouncedSearch);
    setPage(1);
  }

  const params = { page, search: debouncedSearch, limit: BOARD_MEMBERS_PAGE_SIZE };

  const { data, isLoading, isFetching } = useBoardMembers(board.id, params, enabled);
  const updateRole = useUpdateMemberRole(board.id, params);
  const removeMember = useRemoveMember(board.id, params);
  const transferOwnership = useTransferOwnership(board.id);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit || BOARD_MEMBERS_PAGE_SIZE)));

  const [transferTarget, setTransferTarget] = useState<BoardMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<BoardMember | null>(null);
  const viewerRole = board.viewer.role;
  const canManage = canManageBoard(viewerRole);

  function handlePromote(member: BoardMember) {
    updateRole.mutateAsync({ userId: member.user_id, role: "admin" }).then(() => toast.success(t("promoted")), reportError);
  }

  function handleDemote(member: BoardMember) {
    updateRole.mutateAsync({ userId: member.user_id, role: "member" }).then(() => toast.success(t("demoted")), reportError);
  }

  async function handleRemove() {
    if (!removeTarget) return;
    await removeMember.mutateAsync({ userId: removeTarget.user_id }).then(() => {
      toast.success(t("removed"));
      setRemoveTarget(null);
    }, reportError);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("search")}
          className="pl-9 placeholder:text-sm"
          aria-label={t("search")}
        />
      </div>

      {!isLoading && data ? <p className="px-0.5 text-2xs text-muted-foreground tabular-nums">{tBoards("members", { count: data.total })}</p> : null}

      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5">
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-14 shrink-0 rounded-md" />
            </li>
          ))}
        </ul>
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-lg border bg-muted p-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.items.map((member) => {
            const isSelf = member.user_id === currentUserId;
            const displayName = [member.first_name, member.last_name].filter(Boolean).join(" ") || member.username;
            // Only an owner may act on an admin; admins can manage members only.
            const canActOnTarget = viewerRole === "owner" || member.role === "member";
            const showActions = canManage && !isSelf && member.role !== "owner" && canActOnTarget;

            return (
              <li key={member.user_id} className="flex min-w-0 items-center gap-2 rounded-lg border bg-card px-3 py-2.5">
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{displayName}</span>
                    {isSelf ? <span className="shrink-0 text-2xs uppercase tracking-wide text-muted-foreground">· {t("you")}</span> : null}
                  </span>
                  <span className="truncate text-2xs text-muted-foreground">@{member.username}</span>
                </div>
                <RoleChip role={member.role} className="shrink-0" />
                {/* Fixed slot keeps the badge column aligned whether or not the row has actions (owner/self have none). */}
                <div className="flex w-8 shrink-0 items-center justify-center">
                  {showActions ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={t("actions")} className="group">
                          <ChevronDown className="size-4 group-data-[state=open]:hidden" aria-hidden />
                          <ChevronUp className="hidden size-4 group-data-[state=open]:block" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-auto min-w-44">
                        {member.role === "member" ? (
                          <DropdownMenuItem className="cursor-pointer" onSelect={() => handlePromote(member)}>
                            <ShieldUser className="size-4" aria-hidden /> {t("promote")}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="cursor-pointer" onSelect={() => handleDemote(member)}>
                            <ShieldOff className="size-4" aria-hidden /> {t("demote")}
                          </DropdownMenuItem>
                        )}
                        {viewerRole === "owner" ? (
                          <DropdownMenuItem className="cursor-pointer" onSelect={() => setTransferTarget(member)}>
                            <Crown className="size-4" aria-hidden /> {t("transfer")}
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" variant="destructive" onSelect={() => setRemoveTarget(member)}>
                          <UserX className="size-4" aria-hidden /> {t("remove")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isFetching}
            aria-label={t("pagination.prev")}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <span className="text-2xs text-muted-foreground tabular-nums">{t("pagination.page", { page, total: totalPages })}</span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isFetching}
            aria-label={t("pagination.next")}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      ) : null}

      <TransferOwnershipDialog
        target={transferTarget}
        onOpenChange={(open) => !open && setTransferTarget(null)}
        onSubmit={async () => {
          if (!transferTarget) return;
          await transferOwnership.mutateAsync({ userId: transferTarget.user_id }).then(() => {
            toast.success(t("transferConfirm.success"));
            setTransferTarget(null);
            router.refresh();
          }, reportError);
        }}
        isPending={transferOwnership.isPending}
      />

      <RemoveMemberDialog target={removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)} onSubmit={handleRemove} isPending={removeMember.isPending} />
    </div>
  );
}

type RemoveProps = {
  target: BoardMember | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => Promise<void>;
  isPending: boolean;
};

function RemoveMemberDialog({ target, onOpenChange, onSubmit, isPending }: RemoveProps) {
  const t = useTranslations("boards.manage.members.removeConfirm");

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent>
        {target ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("title", { name: [target.first_name, target.last_name].filter(Boolean).join(" ") || target.username })}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={onSubmit} disabled={isPending}>
                {t("submit")}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type TransferProps = {
  target: BoardMember | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => Promise<void>;
  isPending: boolean;
};

function TransferOwnershipDialog({ target, onOpenChange, onSubmit, isPending }: TransferProps) {
  const t = useTranslations("boards.manage.members.transferConfirm");
  const [typed, setTyped] = useState("");
  const focus = useAutoFocusUnlessMobile();

  const open = Boolean(target);
  const isValid = target ? typed.trim() === target.username : false;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped("");
        onOpenChange(next);
      }}
    >
      <DialogContent onOpenAutoFocus={focus.onOpenAutoFocus}>
        {target ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("title", { name: [target.first_name, target.last_name].filter(Boolean).join(" ") || target.username })}</DialogTitle>
              <DialogDescription>{t("description", { username: target.username })}</DialogDescription>
            </DialogHeader>
            <Input value={typed} onChange={(event) => setTyped(event.target.value)} placeholder={t("placeholder")} autoFocus={focus.autoFocus} />
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={onSubmit} disabled={!isValid || isPending}>
                {t("submit")}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
