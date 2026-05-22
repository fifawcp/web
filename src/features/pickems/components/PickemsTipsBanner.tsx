"use client";

import { useState } from "react";
import { GripVertical, Lightbulb, Lock, LockOpen, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

type Props = {
  className?: string;
};

export function PickemsTipsBanner({ className }: Props) {
  const t = useTranslations("pickems.groups");
  const [dragDismissed, setDragDismissed] = useState(false);
  const [lockDismissed, setLockDismissed] = useState(false);

  if (dragDismissed && lockDismissed) return null;

  return (
    <div className={cn("grid grid-cols-1 gap-3 lg:grid-cols-2", className)}>
      {!dragDismissed && (
        <Tip
          tone="amber"
          icon={<Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-500" strokeWidth={2.25} aria-hidden />}
          body={t.rich("tipsBody", {
            handle: () => <GripVertical className="inline size-4 align-text-bottom text-foreground" strokeWidth={2.5} aria-hidden />,
          })}
          dismissLabel={t("tipsDismiss")}
          onDismiss={() => setDragDismissed(true)}
        />
      )}
      {!lockDismissed && (
        <Tip
          tone="accent"
          icon={<Lock className="mt-0.5 size-5 shrink-0 text-page-accent-strong" strokeWidth={2.25} aria-hidden />}
          body={t.rich("tipsLockBody", {
            lockIcon: () => <LockOpen className="inline size-4 align-text-bottom text-foreground" strokeWidth={2.5} aria-hidden />,
          })}
          dismissLabel={t("tipsDismiss")}
          onDismiss={() => setLockDismissed(true)}
        />
      )}
    </div>
  );
}

type TipTone = "amber" | "accent";

function Tip({
  tone,
  icon,
  body,
  dismissLabel,
  onDismiss,
}: {
  tone: TipTone;
  icon: React.ReactNode;
  body: React.ReactNode;
  dismissLabel: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3 py-3",
        tone === "amber" && "border-amber-300/70 bg-amber-100/80 dark:border-amber-500/30 dark:bg-amber-500/15",
        tone === "accent" && "border-page-accent/20 bg-page-accent-soft"
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 text-sm leading-snug text-foreground/85">{body}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={dismissLabel}
        className="-mt-1 -mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
