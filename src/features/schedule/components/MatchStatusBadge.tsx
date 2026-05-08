"use client";

import { Check, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

type BadgeState = "picked" | "locked";

const variantClasses: Record<BadgeState, string> = {
  picked: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  locked: "bg-muted text-muted-foreground",
};

const icons: Record<BadgeState, typeof Check> = {
  picked: Check,
  locked: Lock,
};

export function MatchStatusBadge({ state, className }: { state: BadgeState; className?: string }) {
  const t = useTranslations("schedule.badge");
  const Icon = icons[state];

  return (
    <Badge variant="default" className={cn(variantClasses[state], "gap-1 normal-case", className)}>
      <Icon className="size-3" aria-hidden />
      {t(state)}
    </Badge>
  );
}
