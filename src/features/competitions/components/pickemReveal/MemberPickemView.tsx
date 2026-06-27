"use client";

import { useState } from "react";
import { ChevronLeft, ChevronsDownUp, ChevronsUpDown, Hash, ListOrdered, Lock, Star, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

import type { UserPickem } from "@/features/pickems/types/pickems.types";
import type { Match } from "@/features/schedule/types/schedule.types";
import { getAccuracyPillClass, getThirdPlacePillClass } from "@/features/standings/lib/comparison";
import type { PickAccuracy, StandingRow, ThirdPlaceAccuracy } from "@/features/standings/types/standings.types";
import { Link } from "@/i18n/navigation";
import { MemberAvatar } from "@/shared/components/MemberAvatar";
import { Reveal } from "@/shared/components/Reveal";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { displayName } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import { buildGroupReveal, buildThirdsReveal } from "../../lib/pickemRevealCompare";
import type { LeaderboardMember, PickemScore } from "../../types/competitions.types";

import { RevealBestThirds } from "./RevealBestThirds";
import { RevealBracket } from "./RevealBracket";
import { RevealGroupCard } from "./RevealGroupCard";

type Props = {
  boardId: number;
  competitionId: number;
  member: LeaderboardMember;
  // From the competition leaderboard — omitted when the member sits past the lookup window.
  rank: number | null;
  score: PickemScore | null;
  // null when the tournament hasn't locked yet (predictions stay hidden until then).
  pickem: UserPickem | null;
  // Live results the member's predictions are scored against.
  standings: StandingRow[];
  matches: Match[];
};

export function MemberPickemView({ boardId, competitionId, member, rank, score, pickem, standings, matches }: Props) {
  const t = useTranslations("competitions.memberPickem");
  const isMobile = useIsMobile();
  const name = displayName(member.username, member.first_name, member.last_name);
  const backHref = `/boards/${boardId}/competitions/${competitionId}`;

  // A member who made no pick'em can come back with missing arrays — default them
  // so the sections still render (empty groups, "—" thirds, no bracket checks).
  const groupPicks = pickem?.group_picks ?? [];
  const bestThirds = pickem?.best_thirds ?? [];
  const bracketSlots = pickem?.bracket ?? [];

  // The leaderboard score is the source of truth for points — the member endpoint
  // returns a fully-seeded, locked pickem even for members who never played, so we
  // grade a section only where the board actually credited points; otherwise every
  // pick reads "not picked" (`—`).
  const groupsScored = (score?.group_exact_positions ?? 0) > 0 || (score?.group_qualifier_hits ?? 0) > 0;
  const thirdsScored = (score?.best_third_hits ?? 0) > 0;
  // The bracket greens correctly predicted reaches (incl. the R32 group call, which
  // scores no bracket points), so it gates on having played at all, not on bracket points.
  const participated = (score?.total ?? 0) > 0;

  const groupReveal = pickem ? buildGroupReveal(groupPicks, standings, groupsScored) : null;
  const thirdsReveal = pickem ? buildThirdsReveal(bestThirds, standings, thirdsScored) : null;
  const groupsDecided = groupReveal ? [...groupReveal.values()].some((g) => g.decided) : false;

  // Group cards are expanded by default; the parent owns the open set so one
  // toggle can expand / collapse them all.
  const groupCodes = groupPicks.map((g) => g.group_code);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(groupCodes));
  const allGroupsExpanded = groupCodes.length > 0 && groupCodes.every((c) => expandedGroups.has(c));
  const toggleGroup = (code: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  const toggleAllGroups = () => setExpandedGroups(allGroupsExpanded ? new Set() : new Set(groupCodes));

  // Total group points earned vs. attainable from the finished groups — the same
  // earned / possible read the bracket legend gives.
  const groupTally = groupReveal
    ? [...groupReveal.values()].reduce((acc, g) => (g.summary ? { earned: acc.earned + g.summary.points, possible: acc.possible + g.summary.maxPoints } : acc), {
        earned: 0,
        possible: 0,
      })
    : { earned: 0, possible: 0 };

  const groupsSection = (
    <Reveal from="up" trigger="mount" delay={0.06}>
      <Section icon={ListOrdered} title={t("sections.groups")}>
        {groupsDecided ? <GroupsLegend earned={groupTally.earned} possible={groupTally.possible} /> : null}
        {groupPicks.length > 0 ? (
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={toggleAllGroups} className="text-muted-foreground">
              {allGroupsExpanded ? <ChevronsDownUp className="size-4" aria-hidden /> : <ChevronsUpDown className="size-4" aria-hidden />}
              {allGroupsExpanded ? t("collapseAll") : t("expandAll")}
            </Button>
          </div>
        ) : null}
        {/* items-start so expanding one card doesn't stretch its row-mates to match. */}
        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {groupPicks.map((group) => (
            <RevealGroupCard
              key={group.group_code}
              group={group}
              data={groupReveal?.get(group.group_code)}
              open={expandedGroups.has(group.group_code)}
              onToggle={() => toggleGroup(group.group_code)}
            />
          ))}
        </div>
      </Section>
    </Reveal>
  );

  const thirdsSection = (
    <Reveal from="up" trigger="mount" delay={0.1}>
      <Section icon={Star} title={t("sections.thirds")}>
        {thirdsReveal?.decided ? <ThirdsLegend earned={thirdsReveal.earned} possible={thirdsReveal.possible} /> : null}
        <RevealBestThirds picks={bestThirds} reveal={thirdsReveal ?? undefined} />
      </Section>
    </Reveal>
  );

  const bracketSection = (
    <Reveal from="up" trigger="mount" delay={0.14}>
      <Section icon={Trophy} title={t("sections.bracket")}>
        <RevealBracket bracket={bracketSlots} matches={matches} participated={participated} />
      </Section>
    </Reveal>
  );

  return (
    <section className="container flex flex-col gap-6 pt-6 pb-10 lg:pt-8 lg:pb-12">
      <Link href={backHref} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ChevronLeft className="size-4" aria-hidden />
        {t("back")}
      </Link>

      <Reveal from="up" trigger="mount">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <MemberAvatar username={member.username} firstName={member.first_name} lastName={member.last_name} neutral className="size-12" fallbackClassName="text-sm" />
            <div className="flex min-w-0 flex-col leading-tight">
              <h1 className="truncate font-heading text-xl font-bold tracking-tight sm:text-2xl">{name}</h1>
              {member.username ? <span className="truncate text-sm text-muted-foreground">@{member.username}</span> : null}
            </div>
          </div>

          {score ? <ScoreBreakdown score={score} rank={rank} /> : null}
        </header>
      </Reveal>

      {!pickem ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-foreground/10 bg-card px-6 py-12 text-center shadow-xs">
          <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <Lock className="size-5" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-heading text-base font-semibold">{t("locked.title")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t("locked.description")}</p>
          </div>
        </div>
      ) : isMobile ? (
        // Mobile: split the two stages into tabs so each fits the viewport and the
        // bracket gets the full width it needs.
        <Tabs defaultValue="groups">
          <TabsList className="w-full">
            <TabsTrigger value="groups">{t("tabs.groups")}</TabsTrigger>
            <TabsTrigger value="knockout">{t("tabs.knockout")}</TabsTrigger>
          </TabsList>
          <TabsContent value="groups" className="mt-6 flex flex-col gap-10">
            {groupsSection}
            {thirdsSection}
          </TabsContent>
          <TabsContent value="knockout" className="mt-6">
            {bracketSection}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col gap-10">
          {groupsSection}
          {thirdsSection}
          {bracketSection}
        </div>
      )}
    </section>
  );
}

// The points the member earned, as the board scores them: total up top, then the
// same per-category breakdown the leaderboard shows.
function ScoreBreakdown({ score, rank }: { score: PickemScore; rank: number | null }) {
  const t = useTranslations("competitions.memberPickem");
  const tCols = useTranslations("competitions.leaderboard.columnsLong");

  const metrics: { label: string; value: number }[] = [
    { label: tCols("groupExact"), value: score.group_exact_positions },
    { label: tCols("groupQualifiers"), value: score.group_qualifier_hits },
    { label: tCols("bestThirds"), value: score.best_third_hits },
    { label: tCols("bracket"), value: score.bracket_hits },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            <Star className="size-3.5 text-page-accent-strong" aria-hidden />
            {t("score.total")}
          </span>
          <span className="font-heading text-3xl font-bold tabular-nums leading-none">{score.total.toLocaleString()}</span>
        </div>
        {rank !== null ? (
          <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-sm font-semibold tabular-nums">
            <Hash className="size-3.5 text-page-accent-strong" aria-hidden />
            {rank}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col gap-0.5">
            <dt className="truncate text-2xs font-medium uppercase tracking-wider text-muted-foreground">{metric.label}</dt>
            <dd className="font-heading text-base font-semibold tabular-nums">{metric.value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const pillBase = "inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-2xs font-semibold tabular-nums";

// "How to read" key for the group position circles — mirrors `/standings`, with
// the earned / possible group-points tally read the same way as the bracket legend.
function GroupsLegend({ earned, possible }: { earned: number; possible: number }) {
  const t = useTranslations("competitions.memberPickem.groupsLegend");
  const items: { accuracy: PickAccuracy; content: string; label: string }[] = [
    { accuracy: "exact_3pts", content: "1", label: t("exact") },
    { accuracy: "top2_1pt", content: "1", label: t("top2") },
    { accuracy: "wrong_0pts", content: "1", label: t("wrong") },
    { accuracy: "not_picked", content: "—", label: t("notPicked") },
  ];
  return (
    <section aria-label={t("title")} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("title")}</p>
          <p className="text-xs font-semibold text-foreground">{t("help")}</p>
        </div>
        {possible > 0 && (
          <div className="flex shrink-0 flex-col items-end leading-none">
            <span className="flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-page-accent">{earned}</span>
              <span className="text-sm tabular-nums text-muted-foreground">/ {possible}</span>
              <span className="ml-0.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("pointsLabel")}</span>
            </span>
            <span className="mt-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("earnedPossible")}</span>
          </div>
        )}
      </div>
      <ul className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className={cn(pillBase, getAccuracyPillClass(item.accuracy))}>{item.content}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

// "How to read" key for the best-thirds circles — mirrors `/standings`, with the
// earned / possible best-thirds tally read the same way as the other legends.
function ThirdsLegend({ earned, possible }: { earned: number; possible: number }) {
  const t = useTranslations("competitions.memberPickem.thirdsLegend");
  const items: { accuracy: ThirdPlaceAccuracy; content: string; label: string }[] = [
    { accuracy: "correct", content: "✓", label: t("correct") },
    { accuracy: "wrong", content: "✕", label: t("wrong") },
    { accuracy: "not_picked", content: "—", label: t("notPicked") },
  ];
  return (
    <section aria-label={t("title")} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("title")}</p>
          <p className="text-xs font-semibold text-foreground">{t("help")}</p>
        </div>
        {possible > 0 && (
          <div className="flex shrink-0 flex-col items-end leading-none">
            <span className="flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-page-accent">{earned}</span>
              <span className="text-sm tabular-nums text-muted-foreground">/ {possible}</span>
              <span className="ml-0.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("pointsLabel")}</span>
            </span>
            <span className="mt-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("earnedPossible")}</span>
          </div>
        )}
      </div>
      <ul className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className={cn(pillBase, getThirdPlacePillClass(item.accuracy))}>{item.content}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-page-accent-soft">
          <Icon className="size-4 text-page-accent-strong" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}
