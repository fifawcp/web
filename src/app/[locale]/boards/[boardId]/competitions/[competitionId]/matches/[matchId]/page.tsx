import { ChevronLeft, Eye } from "lucide-react";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { BOARDS_LIST_TAG, boardTag } from "@/features/boards/api/boards";
import type { Board, BoardListItem } from "@/features/boards/types/boards.types";
import { boardMatchPicksTag } from "@/features/competitions/api/predictions";
import { MatchBreakdownView } from "@/features/competitions/components/breakdown/MatchBreakdownView";
import type { BoardMatchPicks } from "@/features/competitions/types/predictions.types";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

type Props = {
  params: Promise<{ boardId: string; competitionId: string; matchId: string }>;
};

export default async function MatchBreakdownPage({ params }: Props) {
  const [{ boardId, competitionId, matchId }, locale] = await Promise.all([params, getLocale()]);
  const user = await getCurrentUser();
  if (!user) notFound();

  const boardIdNum = Number(boardId);
  const competitionIdNum = Number(competitionId);
  const matchIdNum = Number(matchId);
  if (![boardIdNum, competitionIdNum, matchIdNum].every(Number.isFinite)) notFound();

  const [boardsRes, boardRes] = await Promise.all([
    serverApi.get<BoardListItem[]>("/api/boards", { authenticated: true, next: { revalidate: 30, tags: [BOARDS_LIST_TAG] } }),
    serverApi.get<Board>(`/api/boards/${boardIdNum}`, { authenticated: true, next: { revalidate: 30, tags: [boardTag(boardIdNum)] } }),
  ]);

  if (!boardsRes.success) throw new Error(boardsRes.error?.message ?? "Failed to load boards");
  const boards = boardsRes.data ?? [];

  // Mirror the competition page's self-healing: missing board or non-member bounces to a fallback.
  const isMember = boards.some((b) => b.id === boardIdNum);
  if (!boardRes.success || !boardRes.data || !isMember) {
    const fallback = boards.find((b) => b.privacy === "global") ?? boards[0];
    if (fallback) redirect({ href: `/boards/${fallback.id}?notice=board-not-found`, locale });
    notFound();
  }

  const t = await getTranslations("competitions.breakdown");
  const backHref = `/boards/${boardIdNum}/competitions/${competitionIdNum}`;

  const picksRes = await serverApi.get<BoardMatchPicks>(`/api/boards/${boardIdNum}/matches/${matchIdNum}/picks`, {
    authenticated: true,
    next: { revalidate: 30, tags: [boardMatchPicksTag(boardIdNum, matchIdNum)] },
  });

  // Picks stay hidden until kickoff — the upstream returns an error before then.
  if (!picksRes.success || !picksRes.data) {
    return (
      <section className="container flex flex-col gap-5 pt-6 pb-8 lg:pt-8">
        <BackLink href={backHref} label={t("back")} />
        <div className="rounded-xl border border-foreground/10 bg-card p-10 text-center shadow-xs">
          <p className="font-heading text-base font-semibold">{t("locked.title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("locked.description")}</p>
        </div>
      </section>
    );
  }

  const { match } = picksRes.data;
  const stageT = await getTranslations("schedule.filters.stage");

  return (
    <section className="container flex flex-col gap-5 pt-6 pb-8 lg:pt-8">
      <BackLink href={backHref} label={t("back")} />

      <header>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-page-accent-strong">
          <Eye className="size-4" aria-hidden />
          {t("eyebrow")} · {stageT(match.stage_code)}
        </span>
      </header>

      <MatchBreakdownView boardId={boardIdNum} matchId={matchIdNum} currentUserId={user.id} initialData={picksRes.data} showRank />
    </section>
  );
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
      <ChevronLeft className="size-4" aria-hidden />
      {label}
    </Link>
  );
}
