type PodiumIconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

/**
 * 1-2-3 podium glyph for "compete / climb the rankings" copy. Number labels
 * are baked into the SVG so the badge reads at small sizes without extra DOM.
 */
export function PodiumIcon({ className, size = 24, strokeWidth = 1.5 }: PodiumIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.5 5.5L10 3L11 4L12 2L13 4L14 3L15.5 5.5" />
      <path d="M8.5 5.5h7" />

      <rect x="8.5" y="6" width="7" height="16" rx="0.75" />
      <rect x="1.5" y="11" width="7" height="11" rx="0.75" />
      <rect x="15.5" y="14.5" width="7" height="7.5" rx="0.75" />

      <text x="12" y="14.5" fontSize="6" fontWeight="700" textAnchor="middle" dominantBaseline="central" fill="currentColor" stroke="none">
        1
      </text>
      <text x="5" y="16.75" fontSize="5" fontWeight="700" textAnchor="middle" dominantBaseline="central" fill="currentColor" stroke="none">
        2
      </text>
      <text x="19" y="18.5" fontSize="4.5" fontWeight="700" textAnchor="middle" dominantBaseline="central" fill="currentColor" stroke="none">
        3
      </text>
    </svg>
  );
}
