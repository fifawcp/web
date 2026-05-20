"use client";

import { useState } from "react";
import { GripVertical, Lightbulb, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

type Props = {
  className?: string;
};

/**
 * In-memory dismissal: the tip shows on every fresh page load and the X only
 * hides it for the current navigation. Persistent dismissal kept hiding it for
 * users who had previously dismissed it during testing.
 *
 * Mobile/tablet only — at lg+ the drag handle is right next to the team rows
 * and the tip becomes noise. Hidden via `lg:hidden`.
 */
export function PickemsTipsBanner({ className }: Props) {
  const t = useTranslations("pickems.groups");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border border-border bg-card px-3 py-3 lg:hidden", className)}>
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
      <span className="mt-0.5 shrink-0 text-xs font-semibold uppercase tracking-wider text-foreground">{t("tipsHeader")}</span>
      <span className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
        {t.rich("tipsBody", {
          handle: () => <GripVertical className="inline size-3.5 align-text-bottom text-foreground" strokeWidth={2.5} aria-hidden />,
        })}
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t("tipsDismiss")}
        className="-mt-1 -mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
