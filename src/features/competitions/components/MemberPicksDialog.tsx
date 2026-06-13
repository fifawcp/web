"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Hash, Search, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { Match, UserScorePick } from "@/features/schedule/types/schedule.types";
import { Link } from "@/i18n/navigation";
import { MemberAvatar } from "@/shared/components/MemberAvatar";
import { StatPill } from "@/shared/components/StatPill";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { getTeamName } from "@/shared/lib/getTeamName";
import { displayName } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import { useMemberCompetitionPicks } from "../hooks/useMemberCompetitionPicks";
import { categorizePick, type PickCategory } from "../lib/computeMatchBreakdown";
import type { LeaderboardMember } from "../types/competitions.types";

import { CATEGORY_TONE } from "./breakdown/PickCategoryBadge";
import { PredictionScore } from "./breakdown/PredictionScore";
import { ScoringLegend } from "./breakdown/ScoringLegend";
import { StackedMatchTeams } from "./breakdown/StackedMatchTeams";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: number;
  competitionId: number;
  member: LeaderboardMember | null;
  rank: number;
  points: number;
};

// A member's revealed picks across the competition's locked matches. Dialog on
// desktop, drawer on mobile. The predictions list lives in a fixed-height region
// (it scrolls) so filtering never changes the modal height.
export function MemberPicksDialog({ open, onOpenChange, boardId, competitionId, member, rank, points }: Props) {
  const t = useTranslations("competitions.memberPicks");
  const isMobile = useIsMobile();

  const title = member ? displayName(member.username, member.first_name, member.last_name) : t("title");
  const body = member ? (
    <MemberPicksBody boardId={boardId} competitionId={competitionId} member={member} rank={rank} points={points} onNavigate={() => onOpenChange(false)} />
  ) : null;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col px-4 pt-2 pb-6">{body}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[38rem] max-h-[85vh] flex-col overflow-y-hidden sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}

type BodyProps = {
  boardId: number;
  competitionId: number;
  member: LeaderboardMember;
  rank: number;
  points: number;
  onNavigate: () => void;
};

function MemberPicksBody({ boardId, competitionId, member, rank, points, onNavigate }: BodyProps) {
  const t = useTranslations("competitions.memberPicks");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const { data, isLoading } = useMemberCompetitionPicks(boardId, competitionId, member.user_id);

  const hasMatches = (data?.length ?? 0) > 0;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !data) return data ?? [];
    return data.filter((match) => {
      const haystack = [
        match.teams.home ? getTeamName(match.teams.home, locale) : "",
        match.teams.away ? getTeamName(match.teams.away, locale) : "",
        match.teams.home?.fifa_code ?? "",
        match.teams.away?.fifa_code ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [data, query, locale]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <MemberAvatar username={member.username} firstName={member.first_name} lastName={member.last_name} neutral className="size-12" fallbackClassName="text-sm" />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-heading text-base font-semibold">{displayName(member.username, member.first_name, member.last_name)}</span>
          <span className="truncate text-sm text-muted-foreground">@{member.username}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <StatPill icon={Hash} value={`#${rank}`} label={t("stats.rank")} />
        <StatPill icon={Star} value={points.toLocaleString()} label={t("stats.points")} />
      </div>

      <ScoringLegend />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t("revealed")}</h3>
        {hasMatches ? (
          <div className="relative w-full sm:w-52">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} className="h-9 pl-9" />
          </div>
        ) : null}
      </div>

      {/* Only the list scrolls; everything else stays pinned so the modal height is fixed. */}
      {isLoading ? (
        <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index}>
              <Skeleton className="h-12 w-full rounded-lg" />
            </li>
          ))}
        </ul>
      ) : !hasMatches ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="rounded-lg bg-muted px-3 py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-center text-sm text-muted-foreground">{t("noResults")}</p>
        </div>
      ) : (
        <ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-1">
          {visible.map((match) => (
            <li key={match.id}>
              <MemberMatchRow boardId={boardId} competitionId={competitionId} match={match} locale={locale} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      )}

      <p className="shrink-0 text-center text-xs text-muted-foreground">{t("hint")}</p>
    </div>
  );
}

function MemberMatchRow({
  boardId,
  competitionId,
  match,
  locale,
  onNavigate,
}: {
  boardId: number;
  competitionId: number;
  match: Match;
  locale: string;
  onNavigate: () => void;
}) {
  const category = categorizePick(match.user_score_pick, match.result);

  return (
    <Link
      href={`/boards/${boardId}/competitions/${competitionId}/matches/${match.id}`}
      onClick={onNavigate}
      className="group flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-1.5 transition-colors hover:bg-muted"
    >
      <StackedMatchTeams match={match} score={<ScoreChip pick={match.user_score_pick} category={category} />} locale={locale} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

// Predicted score in a verdict-coloured chip (matching the scoring key). No pick →
// muted placeholder; locked-not-finished → a neutral chip (no verdict yet).
function ScoreChip({ pick, category }: { pick: UserScorePick | null; category: PickCategory }) {
  if (!pick) return <PredictionScore pick={null} />;

  const tone = category === "pending" ? "bg-muted text-foreground ring-1 ring-border" : CATEGORY_TONE[category];
  return (
    <span className={cn("mx-2 inline-flex items-center rounded-md px-2.5 py-1 font-heading text-base font-bold tabular-nums", tone)}>
      {pick.home_score}
      <span className="px-1 font-normal opacity-60">&minus;</span>
      {pick.away_score}
    </span>
  );
}
