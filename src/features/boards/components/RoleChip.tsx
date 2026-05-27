import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import type { BoardRole } from "../types/boards.types";

const STYLES: Record<BoardRole, string> = {
  owner: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  admin: "bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200",
  member: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
};

type Props = {
  role: BoardRole;
  className?: string;
};

export function RoleChip({ role, className }: Props) {
  const t = useTranslations("boards.role");
  return <span className={cn("inline-flex h-5 items-center rounded-md px-1.5 text-2xs font-medium uppercase tracking-wide", STYLES[role], className)}>{t(role)}</span>;
}
