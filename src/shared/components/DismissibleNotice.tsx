"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type Tone = "muted" | "amber" | "accent";

type Props = {
  children: React.ReactNode;
  /** Accessible label for the dismiss button. */
  dismissLabel: string;
  /** Leading icon. Defaults to an info glyph; pass `null` to omit. */
  icon?: React.ReactNode;
  tone?: Tone;
  className?: string;
  /** Fired after the close animation finishes. */
  onDismiss?: () => void;
};

const TONE: Record<Tone, string> = {
  muted: "border-border bg-muted/50",
  amber: "border-amber-300/70 bg-amber-100/80 dark:border-amber-500/30 dark:bg-amber-500/15",
  accent: "border-page-accent/20 bg-page-accent-soft",
};

/** Matches the collapse/fade transition duration below. */
const EXIT_MS = 220;

/**
 * Reusable dismissible inline notice. On close it plays a collapse + fade-out
 * (height → 0, opacity → 0, slight lift) before unmounting, so the dismissal
 * feels deliberate rather than an abrupt disappearance. Mirrors the look of
 * the pickems tip banners.
 */
export function DismissibleNotice({ children, dismissLabel, icon, tone = "muted", className, onDismiss }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  if (gone) return null;

  const handleClose = () => {
    setLeaving(true);
    window.setTimeout(() => {
      setGone(true);
      onDismiss?.();
    }, EXIT_MS);
  };

  return (
    // grid-rows 1fr → 0fr animates the *actual* content height (no max-height
    // guesswork / clipping), so the collapse stays smooth for any body length.
    <div className={cn("grid transition-all duration-200 ease-out ", leaving ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100")}>
      <div className="min-h-0 overflow-hidden">
        <div className={cn("flex min-h-full items-start gap-2.5 rounded-xl border px-3 py-3", TONE[tone], className)}>
          {icon === undefined ? <Info className="mt-0.5 size-4.5 shrink-0 text-muted-foreground" aria-hidden /> : icon}
          <span className="min-w-0 flex-1 text-sm leading-snug text-foreground/85">{children}</span>
          <button
            type="button"
            onClick={handleClose}
            aria-label={dismissLabel}
            className="-mt-1 -mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
