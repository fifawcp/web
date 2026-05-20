import { cn } from "@/shared/lib/utils";

type Props = {
  open: boolean;
  className?: string;
};

/**
 * Three-bar hamburger that morphs into an X when `open` is true.
 * Top and bottom bars translate to the centre, then rotate ±45° to cross;
 * the middle bar fades out faster than the rotation so the X arrives cleanly.
 *
 * Uses `bg-current` so it inherits the parent's text color, mirroring Lucide.
 * `h-0.5` (2px) matches Lucide's default stroke-width.
 */
export function HamburgerIcon({ open, className }: Props) {
  return (
    <span aria-hidden className={cn("relative inline-flex size-5 items-center justify-center", className)}>
      <span className={cn("absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-in-out", open ? "rotate-45" : "-translate-y-1.5")} />
      <span className={cn("absolute h-0.5 w-5 rounded-full bg-current transition-opacity duration-150 ease-in-out", open ? "opacity-0" : "opacity-100")} />
      <span className={cn("absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-in-out", open ? "-rotate-45" : "translate-y-1.5")} />
    </span>
  );
}
