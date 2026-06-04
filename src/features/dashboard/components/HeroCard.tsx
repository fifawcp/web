"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Calendar, Sparkles } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { heroSectionAnimation } from "../animations/hero.animations";

type HeroCardProps = {
  badge: React.ReactNode;
  primaryCta: { href: string; label: string };
  bottomContent?: React.ReactNode;
};

export function HeroCard({ badge, primaryCta, bottomContent }: HeroCardProps) {
  const t = useTranslations("dashboard.hero");
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !cardRef.current) {
      return;
    }

    return heroSectionAnimation({
      container: containerRef.current,
      card: cardRef.current,
      background: backgroundRef.current,
    });
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div ref={backgroundRef} className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-full opacity-0 pointer-events-none">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent" />
        </div>
      </div>

      <Card ref={cardRef} className="relative overflow-hidden p-4 sm:p-6 md:p-8 bg-background opacity-0 z-10">
        {/* Mobile stadium image */}
        <div className="pointer-events-none absolute inset-0 sm:hidden">
          <Image
            src="/banner-stadium-mobile.webp"
            alt=""
            fill
            className="object-cover object-bottom-right opacity-40"
            sizes="600px"
            fetchPriority="high"
            loading="eager"
          />
          <div className="absolute inset-0 bg-linear-to-r from-background from-0% via-background/90 via-50% to-transparent to-70%" />
        </div>
        {/* Desktop stadium image */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <Image src="/banner-stadium.webp" alt="" fill className="object-cover object-bottom-right opacity-40" sizes="1024px" fetchPriority="high" loading="eager" />
          <div className="absolute inset-0 bg-linear-to-r from-background from-0% via-background/90 via-50% to-transparent to-70%" />
        </div>

        <div className="flex flex-col gap-4 sm:gap-5 relative z-10">
          {badge}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight max-w-full sm:max-w-3/4">{t("title")}</h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-full sm:max-w-1/2">{t("subtitle")}</p>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Button asChild className="w-full bg-page-accent-300 text-zinc-950 hover:bg-page-accent sm:w-auto sm:px-6 md:w-54 lg:px-10">
              <Link href={primaryCta.href}>
                <Sparkles className="size-4" />
                {primaryCta.label}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto sm:px-6 lg:px-10 md:w-54">
              <Link href="/schedule">
                <Calendar className="size-4" />
                {t("cta.viewSchedule")}
              </Link>
            </Button>
          </div>
          {bottomContent && (
            // pt matches the parent flex `gap-4 sm:gap-5` so the divider has
            // equal breathing room above and below it.
            <div className="flex flex-col sm:flex-row items-stretch sm:divide-x divide-border border-t border-border pt-4 sm:pt-5">{bottomContent}</div>
          )}
        </div>
      </Card>
    </div>
  );
}
