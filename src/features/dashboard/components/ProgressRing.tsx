"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  value: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: ReactNode;
};

// Generic progress ring. Stroke color follows `currentColor`, so callers set it
// via text-* classes; the track always uses the muted token.
export function ProgressRing({ value, total, size = 52, strokeWidth = 5, className, children }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = total > 0 ? Math.min(1, value / total) * circumference : 0;

  // Start empty and sweep to the target on mount.
  const [dash, setDash] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDash(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <span className={`relative inline-flex shrink-0 ${className ?? ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-muted)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 800ms ease-out" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-foreground">{children}</span>
    </span>
  );
}
