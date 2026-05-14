"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { useCountdown } from "../hooks/useCountdown";
import { TOURNAMENT_START_DATE } from "../lib/tournamentConfig";

export function PickemsSection() {
  const t = useTranslations("dashboard.guest.pickems");
  const countdown = useCountdown(TOURNAMENT_START_DATE);

  return (
    <Card size="sm" className="bg-card p-6 flex flex-col max-w-1/2">
      <div className="flex items-center justify-between mb-4">
        <Sparkles className="size-5 text-muted-foreground" />
        {!countdown.isExpired && <span className="text-xs text-muted-foreground">{t("daysToLockIn", { days: countdown.days })}</span>}
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("label")}</span>
      <h2 className="mt-2 text-2xl font-bold leading-tight">{t("title")}</h2>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t("description")}</p>
      <div className="flex items-center gap-3 mt-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/schedule">
            {t("openPickems")}
            <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/schedule">{t("viewAwards")}</Link>
        </Button>
      </div>
    </Card>
  );
}
