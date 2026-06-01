"use client";

import { GripVertical, Lightbulb, Lock, LockOpen } from "lucide-react";
import { useTranslations } from "next-intl";

import { DismissibleNotice } from "@/shared/components/DismissibleNotice";
import { cn } from "@/shared/lib/utils";

type Props = {
  className?: string;
};

/**
 * The two step-1 tips (drag-to-reorder + lock-to-confirm), each a dismissible
 * notice. Built on the shared `DismissibleNotice` so the dismiss animation and
 * styling stay consistent with the awards disclaimer.
 */
export function PickemsTipsBanner({ className }: Props) {
  const t = useTranslations("pickems.groups");

  return (
    <div className={cn("grid grid-cols-1 gap-3 lg:grid-cols-2", className)}>
      <DismissibleNotice
        tone="amber"
        dismissLabel={t("tipsDismiss")}
        icon={<Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-500" strokeWidth={2.25} aria-hidden />}
      >
        {t.rich("tipsBody", {
          handle: () => <GripVertical className="inline size-4 align-text-bottom text-foreground" strokeWidth={2.5} aria-hidden />,
        })}
      </DismissibleNotice>
      <DismissibleNotice
        tone="accent"
        dismissLabel={t("tipsDismiss")}
        icon={<Lock className="mt-0.5 size-5 shrink-0 text-page-accent-strong" strokeWidth={2.25} aria-hidden />}
      >
        {t.rich("tipsLockBody", {
          lockIcon: () => <LockOpen className="inline size-4 align-text-bottom text-foreground" strokeWidth={2.5} aria-hidden />,
        })}
      </DismissibleNotice>
    </div>
  );
}
