type BracketIconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

/**
 * Minimal knockout-bracket glyph used in marketing/feature lists.
 * Stroke-based so it inherits `currentColor` and respects parent sizing.
 */
export function BracketIcon({ className, size = 24, strokeWidth = 1.5 }: BracketIconProps) {
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
      <path d="M2 1.5h3" />
      <path d="M2 4.5h3" />
      <path d="M2 7.5h3" />
      <path d="M2 10.5h3" />
      <path d="M2 13.5h3" />
      <path d="M2 16.5h3" />
      <path d="M2 19.5h3" />
      <path d="M2 22.5h3" />

      <path d="M5 1.5v3" />
      <path d="M5 7.5v3" />
      <path d="M5 13.5v3" />
      <path d="M5 19.5v3" />

      <path d="M5 3h4" />
      <path d="M5 9h4" />
      <path d="M5 15h4" />
      <path d="M5 21h4" />

      <path d="M9 3v6" />
      <path d="M9 15v6" />

      <path d="M9 6h5" />
      <path d="M9 18h5" />

      <path d="M14 6v12" />
      <path d="M14 12h8" />
    </svg>
  );
}
