"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import type { PickemStep } from "../types/pickems.types";

type Props = {
  step: PickemStep;
  rightSlot?: React.ReactNode;
  className?: string;
};

export function PickemsHeader({ step, rightSlot, className }: Props) {
  const t = useTranslations("pickems");

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {t("title")} · {stepCrumb(step, t)}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{stepTitle(step, t)}</h2>
        <p className="text-sm text-muted-foreground">{stepSubtitle(step, t)}</p>
      </div>
      {rightSlot && <div className="hidden flex-wrap items-center justify-end gap-3 sm:flex sm:flex-col sm:items-end">{rightSlot}</div>}
    </div>
  );
}

function stepCrumb(step: PickemStep, t: ReturnType<typeof useTranslations>) {
  const idx = step === "groups" ? 1 : step === "thirds" ? 2 : 3;
  return t("stepCrumb", { n: idx, total: 3 });
}

function stepTitle(step: PickemStep, t: ReturnType<typeof useTranslations>) {
  if (step === "groups") return t("groups.title");
  if (step === "thirds") return t("bestThirds.title");
  return t("bracket.title");
}

function stepSubtitle(step: PickemStep, t: ReturnType<typeof useTranslations>) {
  if (step === "groups") return t("groups.subtitleMobile");
  if (step === "thirds") return t("bestThirds.subtitle", { total: 8 });
  return t("bracket.subtitleDesktop");
}
