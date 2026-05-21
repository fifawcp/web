"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

export function PickemsLockedBanner() {
  const t = useTranslations("pickems");

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300">
        <Lock className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{t("locked")}</p>
        <p className="text-muted-foreground">{t("lockedDescription")}</p>
      </div>
    </div>
  );
}
