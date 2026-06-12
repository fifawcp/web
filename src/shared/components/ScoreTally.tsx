type Props = {
  earned: number;
  possible: number;
  /** Short unit label, e.g. "pts" (already translated). */
  pointsLabel: string;
  /** Caption under the figure, e.g. "Earned / possible" (already translated). */
  caption: string;
};

/**
 * Compact "earned / possible" points figure shared by the compare legends
 * (group standings, best thirds, bracket) so every section reports a score the
 * same way. Presentational only — callers pass already-translated labels.
 */
export function ScoreTally({ earned, possible, pointsLabel, caption }: Props) {
  return (
    <div className="flex shrink-0 flex-col items-end leading-none">
      <span className="flex items-baseline gap-1">
        <span className="text-xl font-bold tabular-nums text-page-accent">{earned}</span>
        <span className="text-sm tabular-nums text-muted-foreground">/ {possible}</span>
        <span className="ml-0.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{pointsLabel}</span>
      </span>
      <span className="mt-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{caption}</span>
    </div>
  );
}
