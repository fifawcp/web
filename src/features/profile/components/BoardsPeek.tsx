"use client";

import { ArrowRight, ChevronRight, Trophy, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { BoardSquare } from "@/features/boards/components/BoardSquare";
import { PrivacyChip } from "@/features/boards/components/PrivacyChip";
import type { BoardListItem } from "@/features/boards/types/boards.types";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

type Props = {
  /** All boards the user belongs to. Null = still loading. Empty = no boards yet. */
  boards: BoardListItem[] | null;
  /** True when the fetch failed; takes precedence over null/empty. */
  isError?: boolean;
};

const PREVIEW_LIMIT = 4;

/**
 * Boards peek — lists every board the user belongs to (not just the two
 * global competitions the dashboard exposes). Each board renders as its
 * own row: a colored square avatar, the board name, a privacy chip, and
 * a chevron-link to the board detail page.
 *
 * Caps the preview at 4 rows; a "See all boards (N)" footer link covers
 * the long-tail case so the section stays compact next to CalendarPeek.
 * Loading and empty states are handled inline so the peek doesn't reflow
 * the page when the boards fetch lags.
 */
export function BoardsPeek({ boards, isError = false }: Props) {
  const t = useTranslations("profile.boardsPeek");

  const visible = boards?.slice(0, PREVIEW_LIMIT) ?? [];
  const overflow = Math.max(0, (boards?.length ?? 0) - visible.length);
  const totalCount = boards?.length ?? 0;

  return (
    <section aria-label={t("title")} className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Trophy aria-hidden className="size-4 text-page-accent-strong" />
            {t("title")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        {totalCount > 0 && <CountPill count={totalCount} label={t("countLabel")} />}
      </header>

      {boards === null && !isError && <BoardsListSkeleton />}
      {isError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{t("loadError")}</p>}
      {boards !== null && !isError && boards.length === 0 && <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} cta={t("emptyCta")} />}

      {boards !== null && !isError && visible.length > 0 && (
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
          {visible.map((board) => (
            <li key={board.id}>
              <BoardRow board={board} />
            </li>
          ))}
        </ul>
      )}

      {/* Footer mirrors the CalendarPeek "Open schedule →" pattern. When
          there are extra boards beyond the preview cap, the label flips
          from "Browse all boards" to "See N more boards" so the user
          knows what's hidden behind the link. */}
      <Button asChild variant="ghost" size="sm" className="mt-auto gap-1.5 self-end text-page-accent-strong hover:text-page-accent-strong">
        <Link href="/boards">
          {overflow > 0 ? t("seeMore", { count: overflow }) : t("cta")}
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </section>
  );
}

/** Single board row — avatar + name + privacy chip + chevron. Whole row is the link target. */
function BoardRow({ board }: { board: BoardListItem }) {
  const t = useTranslations("profile.boardsPeek");
  return (
    <Link
      href={`/boards/${board.id}`}
      className="group/board flex items-center gap-3 p-3 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
      aria-label={t("openBoard", { name: board.name })}
    >
      <BoardSquare board={board} className="size-10 shrink-0 text-sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold text-foreground">{board.name}</span>
        <PrivacyChip privacy={board.privacy} size="xs" className="self-start" />
      </div>
      <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/board:text-page-accent-strong" />
    </Link>
  );
}

function CountPill({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex shrink-0 items-baseline gap-1.5 rounded-full border border-page-accent/30 bg-page-accent-soft px-3 py-1 text-page-accent-strong">
      <span className="text-2xs font-medium uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold tabular-nums">{count}</span>
    </div>
  );
}

function BoardsListSkeleton() {
  return (
    <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
      {Array.from({ length: 2 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="size-10 shrink-0 rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="size-4 shrink-0" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ title, description, cta }: { title: string; description: string; cta: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 bg-muted/30 p-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Users aria-hidden className="size-4" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Button asChild variant="outline" size="sm" className="mt-1">
        <Link href="/boards">{cta}</Link>
      </Button>
    </div>
  );
}
