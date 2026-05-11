"use client";

import { useEffect, useState } from "react";

type Props = {
  picked: number;
  missed: number;
  total: number;
  pickedWidth?: number;
  missedWidth?: number;
  baseWidth?: number;
};

const SIZE = 112;
const CENTER = SIZE / 2;
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DEFAULT_PICKED_WIDTH = 15;
const DEFAULT_MISSED_WIDTH = 13;
const DEFAULT_BASE_WIDTH = 10;

const ARC_TRANSITION = "stroke-dasharray 800ms ease-out, stroke-dashoffset 800ms ease-out";

export function PickProgressRadial({
  picked,
  missed,
  total,
  pickedWidth = DEFAULT_PICKED_WIDTH,
  missedWidth = DEFAULT_MISSED_WIDTH,
  baseWidth = DEFAULT_BASE_WIDTH,
}: Props) {
  const safeTotal = Math.max(total, 1);
  const decided = picked + missed;
  const percent = total > 0 ? Math.round((decided / total) * 100) : 0;
  const pickedTarget = (picked / safeTotal) * CIRCUMFERENCE;
  const missedTarget = (missed / safeTotal) * CIRCUMFERENCE;

  const [{ pickedDash, missedDash }, setDashes] = useState({ pickedDash: 0, missedDash: 0 });
  useEffect(() => {
    const id = requestAnimationFrame(() => setDashes({ pickedDash: pickedTarget, missedDash: missedTarget }));
    return () => cancelAnimationFrame(id);
  }, [pickedTarget, missedTarget]);

  return (
    <div className="relative aspect-square w-20 shrink-0 sm:w-24">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full" role="img" aria-label={`${picked} of ${total} picks completed`}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--color-muted)" strokeWidth={baseWidth} />

        {picked > 0 && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="var(--page-accent)"
            strokeWidth={pickedWidth}
            strokeLinecap="butt"
            strokeDasharray={`${pickedDash} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            style={{ transition: ARC_TRANSITION }}
          />
        )}

        {missed > 0 && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="var(--missed-track)"
            strokeWidth={missedWidth}
            strokeLinecap="butt"
            strokeDasharray={`${missedDash} ${CIRCUMFERENCE}`}
            strokeDashoffset={-pickedDash}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            style={{ transition: ARC_TRANSITION }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-base font-bold tabular-nums">{percent}%</div>
    </div>
  );
}
