import { useTranslations } from "next-intl";

import type { Outcome } from "@/features/schedule/lib/scoring";
import type { Match } from "@/features/schedule/types/schedule.types";
import { StatCard } from "@/shared/components/StatCard";
import { matchTeamColors, readableTextColor } from "@/shared/lib/teamColor";
import { cn } from "@/shared/lib/utils";

import type { MatchBreakdown } from "../../lib/computeMatchBreakdown";

type Props = {
  breakdown: MatchBreakdown;
  match: Match;
  // Drops the card chrome (border/bg/padding) so it can be embedded in another surface.
  bare?: boolean;
  // Hides the exact/winner/missed recap tiles — used by the compact desktop preview.
  showRecap?: boolean;
};

const ORDER: Outcome[] = ["home", "draw", "away"];

const DRAW_COLOR = "var(--color-muted-foreground)";

// Right-hand panel: outcome distribution as a segmented bar (one colour per team),
// the recap stats below, and the legend with counts.
export function BreakdownStatsCard({ breakdown, match, bare = false, showRecap = true }: Props) {
  const t = useTranslations("competitions.breakdown");
  const { distribution, total, finished } = breakdown;

  const { home: homeColor, away: awayColor } = matchTeamColors(match.teams.home?.fifa_code ?? "H", match.teams.away?.fifa_code ?? "A");
  const colorOf: Record<Outcome, string> = { home: homeColor, draw: DRAW_COLOR, away: awayColor };

  const labels: Record<Outcome, string> = {
    home: t("outcome.teamWins", { team: match.teams.home?.fifa_code ?? t("outcome.home") }),
    draw: t("outcome.draw"),
    away: t("outcome.teamWins", { team: match.teams.away?.fifa_code ?? t("outcome.away") }),
  };

  return (
    <div className={cn("flex flex-col gap-4", !bare && "h-full rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5")}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{t("distribution.title")}</h3>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{t("predictionCount", { count: total })}</span>
      </div>

      {total === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6 text-sm text-muted-foreground">{t("noPredictions")}</div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <DistributionBar distribution={distribution} total={total} colorOf={colorOf} />
            <Legend distribution={distribution} labels={labels} colorOf={colorOf} />
          </div>

          {finished && showRecap ? (
            <div className="mt-auto grid grid-cols-3 gap-2.5 border-t border-border pt-4">
              <StatCard value={breakdown.exactScores} label={t("recap.exactScore")} tone="exact" />
              <StatCard value={breakdown.correctWinners} label={t("recap.correctWinner")} tone="winner" />
              <StatCard value={breakdown.total - breakdown.correctWinners} label={t("recap.missed")} tone="miss" />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function DistributionBar({ distribution, total, colorOf }: { distribution: Record<Outcome, number>; total: number; colorOf: Record<Outcome, string> }) {
  // Only the bar's outer ends are rounded — inner edges stay square so the
  // segments read as one continuous bar rather than separate pills.
  const visible = ORDER.filter((outcome) => distribution[outcome] > 0);

  return (
    <div className="flex h-9 gap-0.5">
      {visible.map((outcome, index) => {
        const count = distribution[outcome];
        const pct = Math.round((count / total) * 100);
        const isDraw = outcome === "draw";
        return (
          <div
            key={outcome}
            style={{ flexGrow: count, ...(isDraw ? {} : { backgroundColor: colorOf[outcome], color: readableTextColor(colorOf[outcome]) }) }}
            className={cn(
              "flex min-w-1 items-center justify-center overflow-hidden px-1 text-xs font-semibold tabular-nums",
              isDraw && "bg-muted-foreground/40 text-foreground",
              index === 0 && "rounded-l-lg",
              index === visible.length - 1 && "rounded-r-lg"
            )}
          >
            {pct >= 10 ? `${pct}%` : null}
          </div>
        );
      })}
    </div>
  );
}

function Legend({ distribution, labels, colorOf }: { distribution: Record<Outcome, number>; labels: Record<Outcome, string>; colorOf: Record<Outcome, string> }) {
  return (
    <ul className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
      {ORDER.map((outcome) => (
        <li key={outcome} className="flex items-center gap-1.5 text-sm">
          <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorOf[outcome] }} />
          <span className="text-muted-foreground">{labels[outcome]}</span>
          <span className="font-semibold text-foreground tabular-nums">{distribution[outcome]}</span>
        </li>
      ))}
    </ul>
  );
}
