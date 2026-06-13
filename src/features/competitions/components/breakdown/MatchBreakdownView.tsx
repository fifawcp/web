"use client";

import { useMemo } from "react";

import { Reveal } from "@/shared/components/Reveal";

import { useBoardMatchPicks } from "../../hooks/useBoardMatchPicks";
import { computeMatchBreakdown } from "../../lib/computeMatchBreakdown";
import type { BoardMatchPicks } from "../../types/predictions.types";

import { BreakdownMatchCard } from "./BreakdownMatchCard";
import { BreakdownStatsCard } from "./BreakdownStatsCard";
import { MemberPredictionsTable } from "./MemberPredictionsTable";

type Props = {
  boardId: number;
  matchId: number;
  currentUserId: string;
  initialData: BoardMatchPicks;
  // Pick competitions render this as their single ranked table (no separate leaderboard).
  showRank?: boolean;
};

// "How the board predicted this match": match card + stats panel side by side, then
// the member comparison table. Reused by the breakdown route and the single-match
// competition page. The two columns slide in from opposite sides and the table fades up.
export function MatchBreakdownView({ boardId, matchId, currentUserId, initialData, showRank = false }: Props) {
  const { data } = useBoardMatchPicks(boardId, matchId, initialData);
  const source = data ?? initialData;

  const breakdown = useMemo(() => computeMatchBreakdown(source.picks, source.match.result), [source]);
  const yourRow = useMemo(() => breakdown.rows.find((row) => row.member.user_id === currentUserId) ?? null, [breakdown, currentUserId]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <Reveal from="left" trigger="mount" className="h-full">
          <BreakdownMatchCard match={source.match} yourRow={yourRow} />
        </Reveal>
        <Reveal from="right" trigger="mount" delay={0.08} className="h-full">
          <BreakdownStatsCard breakdown={breakdown} match={source.match} />
        </Reveal>
      </div>

      <Reveal from="up" trigger="mount" delay={0.16}>
        <MemberPredictionsTable rows={breakdown.rows} currentUserId={currentUserId} finished={breakdown.finished} showRank={showRank} />
      </Reveal>
    </div>
  );
}
