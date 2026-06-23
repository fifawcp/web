import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Reveal } from "@/shared/components/Reveal";
import { Button } from "@/shared/components/ui/button";

import type { DashboardData } from "../types/dashboard.types";

import { FeaturedMatchCard } from "./FeaturedMatchCard";
import { LandingHero } from "./LandingHero";
import { LandingStats } from "./LandingStats";
import { PickDemo } from "./PickDemo";
import { TitleFavoritesCard } from "./TitleFavoritesCard";
import { WaysToPlay } from "./WaysToPlay";

type Props = {
  data: DashboardData | null;
};

// Logged-out landing: hero → scoring demo → ways to play → by the numbers → CTA.
export async function GuestLanding({ data }: Props) {
  const [t, tDemo] = await Promise.all([getTranslations("dashboard.landing"), getTranslations("dashboard.landing.demo")]);
  const favorites = data?.title_favorites ?? [];
  // The marketing hero showcases a single match even when two kick off together.
  const nextMatch = data?.next_match?.[0] ?? null;

  return (
    <div className="container flex flex-col gap-10 py-6 lg:gap-12 lg:py-8">
      <Reveal from="up">
        <LandingHero nextMatch={nextMatch} />
      </Reveal>

      {/* Mobile: featured match as a standalone full-width card (desktop shows it in the hero) */}
      {nextMatch && (
        <Reveal from="up" className="lg:hidden">
          <FeaturedMatchCard match={nextMatch} isLoggedIn={false} />
        </Reveal>
      )}

      {/* See how scoring works — two-column so it uses the full width */}
      <section id="how-it-works" className="grid scroll-mt-24 items-center gap-8 lg:grid-cols-2">
        <Reveal from="left" className="flex flex-col items-start gap-3">
          <span className="inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-page-accent-strong">
            <Sparkles className="size-3.5" aria-hidden />
            {tDemo("kicker")}
          </span>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{tDemo("title")}</h2>
          <p className="max-w-md text-sm text-muted-foreground sm:text-base">{tDemo("subtitle")}</p>
          <Link
            href="/rules"
            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-page-accent-strong transition-colors hover:text-page-accent hover:underline"
          >
            {tDemo("rulesLink")}
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
        <Reveal from="right">
          <PickDemo />
        </Reveal>
      </section>

      <WaysToPlay />

      {/* By the numbers + social proof — aligned columns */}
      <section className="grid items-stretch gap-8 lg:grid-cols-2">
        <Reveal from="left" className="h-full">
          <LandingStats />
        </Reveal>
        <Reveal from="right" className="flex h-full flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("social.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("social.subtitle")}</p>
          </div>
          <TitleFavoritesCard favorites={favorites} showHeader={false} className="h-full" />
        </Reveal>
      </section>

      <Reveal from="scale">
        <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-500 to-violet-700 px-6 py-12 text-center text-white sm:px-10">
          <span aria-hidden className="pointer-events-none absolute -left-16 -bottom-16 size-72 rounded-full bg-white/15 blur-3xl" />
          <div className="relative mx-auto flex max-w-xl flex-col items-center gap-3">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{t("finalCta.title")}</h2>
            <p className="text-sm text-white/75 sm:text-base">{t("finalCta.subtitle")}</p>
            <Button asChild className="mt-3 h-12 gap-2 bg-white px-6 text-[15px] font-semibold text-violet-700 hover:bg-white/90">
              <Link href="/register">
                {t("finalCta.cta")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
