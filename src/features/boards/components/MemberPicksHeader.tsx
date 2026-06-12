"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { displayName, getInitials } from "@/shared/lib/ui";

import type { BoardMember } from "../types/boards.types";

import { RoleChip } from "./RoleChip";

type Props = {
  boardId: number;
  boardName: string;
  member: BoardMember | null;
};

export function MemberPicksHeader({ boardId, boardName, member }: Props) {
  const t = useTranslations("boards.member");

  const name = member ? displayName(member.username, member.first_name, member.last_name) : t("fallbackName");
  const initials = member ? getInitials(member.username, member.first_name ?? undefined, member.last_name ?? undefined) : "—";

  return (
    <header className="flex flex-col gap-4">
      <Link
        href={`/boards/${boardId}?tab=members`}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t("back", { board: boardName })}
      </Link>

      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-page-accent-soft text-sm font-semibold text-page-accent-strong">{initials}</span>
        <div className="flex min-w-0 flex-col">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{name}</h1>
            {member ? <RoleChip role={member.role} /> : null}
          </div>
          {member ? <span className="truncate text-sm text-muted-foreground">@{member.username}</span> : null}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{t("subtitle", { name })}</p>
    </header>
  );
}
