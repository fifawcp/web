"use client";

import { useMemo } from "react";
import { ListOrdered, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

import { BracketCompareLegend } from "@/features/bracket/components/BracketCompareLegend";
import { buildComparisonMap, summarizeBracket } from "@/features/bracket/lib/bracketCompare";
import { buildActualBracket } from "@/features/bracket/lib/buildActualBracket";
import { BracketTree } from "@/features/pickems/components/BracketTree";
import { findChampion, projectBracket } from "@/features/pickems/lib/projectBracket";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import type { Match } from "@/features/schedule/types/schedule.types";
import { ComparisonLegend } from "@/features/standings/components/ComparisonLegend";
import { GroupCard as StandingsGroupCard } from "@/features/standings/components/GroupCard";
import { ThirdPlaceCard } from "@/features/standings/components/ThirdPlaceCard";
import { buildBestThirdsSet, buildPickIndex, summarizeGroupStage } from "@/features/standings/lib/comparison";
import { groupAndEnrichStandings } from "@/features/standings/lib/groupStandings";
import { buildThirdPlaceStandings } from "@/features/standings/lib/thirdPlace";
import type { StandingRow } from "@/features/standings/types/standings.types";

const NO_DRAFT = {};

type Props = {
  pickem: UserPickem;
  standings: StandingRow[];
  matches: Match[];
};

/**
 * Another member's pick'em shown in COMPARE mode — their predictions measured
 * against the actual results, with the points they earn. Reuses the standings
 * and bracket compare primitives (same scoring the viewer sees on their own
 * `/standings` and `/bracket`), so there's no duplicated logic; only the pickem
 * source differs (this member's, not the viewer's).
 */
export function MemberPickemSections({ pickem, standings, matches }: Props) {
  const t = useTranslations("boards.member");

  // Group-standings compare: the member's group order vs the real table.
  const groups = useMemo(() => groupAndEnrichStandings(standings), [standings]);
  const thirdPlace = useMemo(() => buildThirdPlaceStandings(groups), [groups]);
  const pickIndex = useMemo(() => buildPickIndex(pickem), [pickem]);
  const bestThirds = useMemo(() => buildBestThirdsSet(pickem), [pickem]);
  const groupSummary = useMemo(() => summarizeGroupStage(groups, pickIndex), [groups, pickIndex]);

  // Bracket compare: the member's knockout predictions vs the real bracket.
  const actualSlots = useMemo(() => buildActualBracket(matches), [matches]);
  const predictedSlots = useMemo(() => projectBracket(pickem.bracket, NO_DRAFT), [pickem.bracket]);
  const champion = useMemo(() => findChampion(actualSlots), [actualSlots]);
  const comparisonById = useMemo(() => buildComparisonMap(actualSlots, predictedSlots), [actualSlots, predictedSlots]);
  const summary = useMemo(() => summarizeBracket(actualSlots, predictedSlots), [actualSlots, predictedSlots]);

  return (
    <div className="flex flex-col gap-10">
      <Section icon={ListOrdered} title={t("sections.groups")}>
        <ComparisonLegend summary={groupSummary} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {groups.map((group) => (
            <StandingsGroupCard key={group.group_code} group={group} pickIndex={pickIndex} />
          ))}
        </div>
        <ThirdPlaceCard standings={thirdPlace} bestThirds={bestThirds} />
      </Section>

      <Section icon={Trophy} title={t("sections.bracket")}>
        {summary.possible > 0 ? <BracketCompareLegend summary={summary} /> : null}
        <BracketTree bracket={actualSlots} champion={champion} disabled comparisonById={comparisonById} />
      </Section>
    </div>
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
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}
