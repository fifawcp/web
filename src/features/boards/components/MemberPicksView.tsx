"use client";

import { CalendarClock } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import type { UserAwards } from "@/features/awards/types/awards.types";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import type { Match } from "@/features/schedule/types/schedule.types";
import type { StandingRow } from "@/features/standings/types/standings.types";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

import { useMemberAwards, useMemberPickem } from "../hooks/useMemberPicks";
import type { BoardMember } from "../types/boards.types";

import { MemberAwardsGrid } from "./MemberAwardsGrid";
import { MemberPickemSections } from "./MemberPickemSections";
import { MemberPicksHeader } from "./MemberPicksHeader";

type MemberTab = "pickem" | "awards" | "matches";

const TAB_PARAM = "tab";

// Same active-accent underline as the board's own tabs, for visual continuity.
const ACTIVE_ACCENT = cn(
  "data-active:text-page-accent dark:data-active:text-page-accent",
  "after:bg-page-accent",
  "data-active:hover:text-page-accent-strong dark:data-active:hover:text-page-accent-strong",
  "data-active:hover:after:bg-page-accent-strong"
);

type Props = {
  boardId: number;
  boardName: string;
  userId: string;
  member: BoardMember | null;
  initialPickem: UserPickem | null;
  initialAwards: UserAwards | null;
  /** Actual results the member's predictions are scored against (compare mode). */
  standings: StandingRow[];
  matches: Match[];
};

export function MemberPicksView({ boardId, boardName, userId, member, initialPickem, initialAwards, standings, matches }: Props) {
  const t = useTranslations("boards.member");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: pickem } = useMemberPickem(boardId, userId, initialPickem ?? undefined);
  const { data: awards } = useMemberAwards(boardId, userId, initialAwards ?? undefined);

  const param = searchParams.get(TAB_PARAM);
  const tab: MemberTab = param === "awards" ? "awards" : param === "matches" ? "matches" : "pickem";

  function setTab(next: MemberTab) {
    const params = new URLSearchParams(searchParams);
    if (next === "pickem") params.delete(TAB_PARAM);
    else params.set(TAB_PARAM, next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const tabs: { key: MemberTab; label: string }[] = [
    { key: "pickem", label: t("tabs.pickem") },
    { key: "awards", label: t("tabs.awards") },
    { key: "matches", label: t("tabs.matches") },
  ];

  return (
    <section className="container flex flex-col gap-6 pt-6 pb-10 lg:pt-8 lg:pb-12">
      <MemberPicksHeader boardId={boardId} boardName={boardName} member={member} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as MemberTab)}>
        <TabsList variant="line" className="w-full justify-start gap-4">
          {tabs.map((item) => (
            <TabsTrigger key={item.key} value={item.key} className={cn("flex-none cursor-pointer px-0.5", ACTIVE_ACCENT)}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === "pickem" ? (
        pickem ? (
          <MemberPickemSections pickem={pickem} standings={standings} matches={matches} />
        ) : (
          <Unavailable label={t("picksUnavailable")} />
        )
      ) : tab === "awards" ? (
        awards ? (
          <MemberAwardsGrid awards={awards} />
        ) : (
          <Unavailable label={t("awardsUnavailable")} />
        )
      ) : (
        // Matches: per-match predictions (played matches only). Endpoint not built
        // yet — the tab is reserved with a "coming soon" placeholder.
        <ComingSoon title={t("matchesSoonTitle")} hint={t("matchesSoonHint")} />
      )}
    </section>
  );
}

function Unavailable({ label }: { label: string }) {
  return <p className="rounded-xl border bg-muted p-8 text-center text-sm text-muted-foreground">{label}</p>;
}

function ComingSoon({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-page-accent-soft">
        <CalendarClock className="size-6 text-page-accent-strong" aria-hidden />
      </span>
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  );
}
