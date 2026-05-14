"use client";

import { Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

export function GuestHero() {
  const t = useTranslations("dashboard.guest");

  return (
    <div className="flex flex-col gap-6">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("badge")}</span>
      <h1 className="text-4xl md:text-5xl font-bold leading-tight">{t("hero.title")}</h1>
      <p className="text-base text-muted-foreground leading-relaxed max-w-xl">{t("hero.subtitle")}</p>
      <div className="flex items-center gap-3 mt-2">
        <Button asChild size="sm">
          <Link href="/register">
            <Sparkles className="mr-1.5 size-4" />
            {t("cta.makeYourPicks")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/schedule">
            <Calendar className="mr-1.5 size-4" />
            {t("cta.viewSchedule")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
