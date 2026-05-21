"use client";

import { useState } from "react";
import { GripVertical, Lightbulb, Lock, X } from "lucide-react";
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
          icon={<Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />}
          body={t.rich("tipsBody", {
            handle: () => <GripVertical className="inline size-3.5 align-text-bottom text-foreground" strokeWidth={2.5} aria-hidden />,
          })}
          dismissLabel={t("tipsDismiss")}
          onDismiss={() => setDragDismissed(true)}
        />
      )}
      {!lockDismissed && (
        <Tip
          icon={<Lock className="mt-0.5 size-4 shrink-0 text-page-accent-strong" aria-hidden />}
          body={t.rich("tipsLockBody", {
            lockIcon: () => <Lock className="inline size-3.5 align-text-bottom text-foreground" strokeWidth={2.5} aria-hidden />,
          })}
          dismissLabel={t("tipsDismiss")}
          onDismiss={() => setLockDismissed(true)}
        />
      )}
    </div>
  );
}

function Tip({ icon, body, dismissLabel, onDismiss }: { icon: React.ReactNode; body: React.ReactNode; dismissLabel: string; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-3 py-3">
      {icon}
      <span className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">{body}</span>
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
