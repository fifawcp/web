"use client";

import { CalendarCheck, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/shared/components/ui/card";

type Props = {
  count: number;
  onPress: () => void;
};

export function PendingPicksCta({ count, onPress }: Props) {
  const t = useTranslations("schedule.pending");

  return (
    <button
      type="button"
      onClick={onPress}
      className="block w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-xl"
    >
      <Card size="sm" className="flex-row items-center gap-3 px-4 transition-colors hover:bg-muted">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
          <CalendarCheck className="size-5" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="text-sm font-semibold">
            {t.rich("matches", {
              count,
              highlight: (chunks) => <span className="text-base">{chunks}</span>,
            })}
          </div>
          <div className="text-xs text-muted-foreground">{t("subtitle")}</div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </Card>
    </button>
  );
}
