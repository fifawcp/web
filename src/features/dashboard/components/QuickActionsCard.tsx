import { ChevronRight, GitBranch, UsersRound, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { BoardListItem } from "@/features/boards/types/boards.types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

import { CardReveal } from "./CardReveal";
import { NewCompetitionDialog, QUICK_ACTION_ROW_CLASS } from "./NewCompetitionDialog";

type Props = {
  // The user's last visited board (resolved server-side from the last_board_id cookie).
  board: BoardListItem | null;
  // Boards the viewer can create competitions in (admin/owner, non-global).
  adminBoards: BoardListItem[];
  delay?: number;
  from?: "up" | "left" | "right";
  className?: string;
};

export async function QuickActionsCard({ board, adminBoards, delay, from, className }: Props) {
  const t = await getTranslations("dashboard.quickActions");

  return (
    <CardReveal delay={delay} from={from} className={cn("opacity-0 gap-3 bg-card p-4 sm:p-5", className)}>
      <h2 className="text-base font-semibold">{t("title")}</h2>
      <div className="flex flex-col">
        <NewCompetitionDialog boards={adminBoards} />

        <ActionRow
          href="/boards?dialog=join"
          icon={UsersRound}
          iconClass="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
          label={t("joinBoard")}
          sub={t("joinBoardSub")}
        />

        <ActionRow
          href="/bracket?view=simulate"
          icon={GitBranch}
          iconClass="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          label={t("simulate")}
          sub={t("simulateSub")}
        />

        {board && (
          <ActionRow
            href={`/boards/${board.id}`}
            label={board.name}
            sub={t("lastVisitedSub")}
            leading={
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                  board.privacy === "global" ? "bg-teal-600 text-white" : "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                )}
              >
                {board.name.charAt(0).toUpperCase()}
              </span>
            }
          />
        )}
      </div>
    </CardReveal>
  );
}

type ActionRowProps = {
  href: string;
  label: string;
  sub: string;
  icon?: LucideIcon;
  iconClass?: string;
  leading?: React.ReactNode;
};

function ActionRow({ href, label, sub, icon: Icon, iconClass, leading }: ActionRowProps) {
  return (
    <Link href={href} className={QUICK_ACTION_ROW_CLASS}>
      {leading ??
        (Icon && (
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", iconClass ?? "bg-muted text-muted-foreground")}>
            <Icon className="size-4" aria-hidden />
          </span>
        ))}
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">{label}</span>
        <span className="truncate text-xs text-muted-foreground">{sub}</span>
      </span>
      <ChevronRight className="-mr-1.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
