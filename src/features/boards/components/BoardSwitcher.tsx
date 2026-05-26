"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, LogOut, Plus, Settings2, Ticket, UserPlus, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { cn } from "@/shared/lib/utils";

import { canManageBoard } from "../lib/boardRole";
import { rememberLastBoard } from "../lib/lastBoardCookie";
import type { Board, BoardListItem } from "../types/boards.types";

import { BoardSquare } from "./BoardSquare";

type Props = {
  boards: BoardListItem[];
  activeBoard: Board;
  onInvite: () => void;
  onManage: () => void;
  onLeave: () => void;
  onCreate: () => void;
  onJoin: () => void;
  className?: string;
};

const HEADING_STYLE = "**:[[cmdk-group-heading]]:px-0 **:[[cmdk-group-heading]]:text-2xs **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-wide";

export function BoardSwitcher({ boards, activeBoard, onInvite, onManage, onLeave, onCreate, onJoin, className }: Props) {
  const t = useTranslations("boards");
  const router = useRouter();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !isMobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isMobile]);

  function selectBoard(id: number) {
    setOpen(false);
    if (id === activeBoard.id) return;
    rememberLastBoard(id);
    router.push(`/boards/${id}`);
  }

  function runAction(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label={t("switcher.trigger")}
          onClick={() => setOpen(false)}
          className="supports-backdrop-filter:backdrop-blur-xs absolute inset-x-0 top-full z-40 h-screen bg-black/10 md:hidden"
        />
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label={t("switcher.trigger")}
          className={cn(
            "group flex w-full min-w-0 items-center gap-2.5 rounded-xl border border-foreground/10 bg-card px-4 py-3 text-left shadow-xs transition-colors hover:bg-muted aria-expanded:rounded-b-none aria-expanded:border-b-0 aria-expanded:bg-muted",
            className
          )}
        >
          <BoardSquare board={activeBoard} className="size-11 shrink-0 rounded-lg text-base" />
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{t("label")}</span>
            <span className="truncate font-heading text-sm font-semibold">{activeBoard.name}</span>
          </span>
          <span
            className="flex shrink-0 items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground tabular-nums"
            title={t("members", { count: activeBoard.member_count })}
          >
            <Users className="size-3" aria-hidden />
            {activeBoard.member_count.toLocaleString()}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180" aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={0}
          collisionPadding={12}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="z-50 max-h-[calc(100dvh-7rem)] w-(--radix-popover-trigger-width) min-w-88 overflow-hidden rounded-t-none rounded-b-xl border border-t-0 border-foreground/10 p-0 ring-0"
        >
          <SwitcherContent
            boards={boards}
            activeBoard={activeBoard}
            onSelect={selectBoard}
            onInvite={() => runAction(onInvite)}
            onManage={() => runAction(onManage)}
            onLeave={() => runAction(onLeave)}
            onCreate={() => runAction(onCreate)}
            onJoin={() => runAction(onJoin)}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}

type SwitcherContentProps = {
  boards: BoardListItem[];
  activeBoard: Board;
  onSelect: (id: number) => void;
  onInvite: () => void;
  onManage: () => void;
  onLeave: () => void;
  onCreate: () => void;
  onJoin: () => void;
};

function SwitcherContent({ boards, activeBoard, onSelect, onInvite, onManage, onLeave, onCreate, onJoin }: SwitcherContentProps) {
  const t = useTranslations("boards.switcher");

  // Open with the active board pre-selected so cmdk scrolls it into view and
  // highlights it (matching the always-visible selection in the competition list).
  const boardValue = (board: { name: string; privacy: string }) => `${board.name} ${board.privacy}`;
  const [selected, setSelected] = useState(boardValue(activeBoard));

  const yourBoards = boards.filter((b) => b.privacy !== "global");
  const globalBoard = boards.find((b) => b.privacy === "global");

  const showInvite = Boolean(activeBoard.join_code);
  const showManage = canManageBoard(activeBoard.viewer.role);
  const showLeave = activeBoard.privacy !== "global";
  const hasActions = showInvite || showManage || showLeave;

  return (
    <div className="flex max-h-[inherit] flex-col">
      <Command value={selected} onValueChange={setSelected} className="flex flex-col px-2 pt-2">
        <CommandInput placeholder={t("search")} />
        <CommandList className="max-h-none overflow-visible pt-2">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">{t("noResults")}</CommandEmpty>

          {yourBoards.length > 0 ? (
            <CommandGroup heading={t("sections.yourBoards")} className={cn(HEADING_STYLE, "cmdk-scroll-group px-1 py-0")}>
              {yourBoards.map((board) => (
                <BoardRow key={board.id} board={board} isActive={board.id === activeBoard.id} onSelect={onSelect} />
              ))}
            </CommandGroup>
          ) : null}

          {globalBoard ? (
            <CommandGroup heading={t("sections.global")} className={cn(HEADING_STYLE, "px-1 py-0")}>
              <BoardRow board={globalBoard} isActive={globalBoard.id === activeBoard.id} onSelect={onSelect} />
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>

      {hasActions ? (
        <section className="flex flex-col gap-1.5 border-t p-3">
          <SectionLabel>{t("sections.actions")}</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {showInvite ? <ActionRow icon={UserPlus} title={t("invite")} subtitle={t("inviteSubtitle", { name: activeBoard.name })} onClick={onInvite} /> : null}
            {showManage ? <ActionRow icon={Settings2} title={t("manage")} subtitle={t("manageSubtitle")} onClick={onManage} /> : null}
            {showLeave ? <ActionRow icon={LogOut} title={t("leave")} subtitle={t("leaveSubtitle")} onClick={onLeave} tone="destructive" /> : null}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-1.5 border-t p-3">
        <SectionLabel>{t("sections.more")}</SectionLabel>
        <div className="flex gap-1.5">
          <CompactActionCard icon={Plus} title={t("create")} subtitle={t("createSubtitle")} onClick={onCreate} />
          <CompactActionCard icon={Ticket} title={t("join")} subtitle={t("joinSubtitle")} onClick={onJoin} />
        </div>
      </section>
    </div>
  );
}

function BoardRow({ board, isActive, onSelect }: { board: BoardListItem; isActive: boolean; onSelect: (id: number) => void }) {
  return (
    <CommandItem
      value={`${board.name} ${board.privacy}`}
      onSelect={() => onSelect(board.id)}
      className={cn("flex cursor-pointer items-center gap-2.5 px-2 py-1.5", isActive && "bg-muted")}
    >
      <BoardSquare board={board} className="size-7 shrink-0" />
      <span className={cn("min-w-0 flex-1 truncate text-sm text-foreground", isActive ? "font-semibold" : "font-medium")}>{board.name}</span>
      {isActive ? <Check className="size-3.5 shrink-0 text-page-accent-strong" aria-hidden /> : null}
    </CommandItem>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{children}</p>;
}

type ActionIcon = React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

function ActionRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
  tone = "default",
}: {
  icon: ActionIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
  tone?: "default" | "destructive";
}) {
  const destructive = tone === "destructive";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
        destructive && "hover:border-destructive/30 hover:bg-destructive/5"
      )}
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", destructive ? "bg-destructive/10" : "bg-page-accent-soft")}>
        <Icon className={cn("size-4", destructive ? "text-destructive" : "text-page-accent-strong")} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className={cn("truncate text-sm font-semibold", destructive && "text-destructive")}>{title}</span>
        <span className="truncate text-2xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}

function CompactActionCard({ icon: Icon, title, subtitle, onClick }: { icon: ActionIcon; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <Icon className="size-4 shrink-0 text-page-accent-strong" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">{title}</span>
        <span className="truncate text-2xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}
