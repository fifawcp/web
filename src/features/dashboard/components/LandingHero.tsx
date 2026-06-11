import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";

import type { Match } from "../types/dashboard.types";

import { FeaturedMatchCard } from "./FeaturedMatchCard";
import { TiltCard } from "./TiltCard";

type Props = {
  nextMatch: Match | null;
};

// Guest landing hero: branded panel with the value prop + sign-up CTA, and the
// live featured match as a real product showcase (desktop only — mobile shows
// the match as a standalone card below the hero, see GuestLanding).
export async function LandingHero({ nextMatch }: Props) {
  const t = await getTranslations("dashboard.landing.hero");

  return (
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-500 to-violet-700 px-6 py-10 text-white sm:px-10 sm:py-12 lg:py-14">
      {/* Stadium photo behind the brand gradient */}
      <Image
        src="/banner-stadium.webp"
        alt=""
        fill
        priority
        sizes="(min-width: 640px) 100vw, 0px"
        className="pointer-events-none hidden object-cover object-right opacity-80 mix-blend-overlay sm:block"
      />
      <Image
        src="/banner-stadium-mobile.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 639px) 100vw, 0px"
        className="pointer-events-none object-cover object-right opacity-80 mix-blend-overlay sm:hidden"
      />
      {/* Keep the headline legible over the photo: brand tint, strong on the left, clearing to the right */}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-r from-violet-600 via-violet-600/45 to-transparent" />
      {/* Radial brand glow, top-right */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-white/15 blur-3xl" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_minmax(0,34rem)] xl:grid-cols-[1fr_minmax(0,40rem)]">
        <div className="flex flex-col items-start">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            {t("badge")}
          </span>
          <h1 className="text-balance font-heading text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">{t("title")}</h1>
          <p className="mt-4 max-w-lg text-sm text-white/75 sm:text-base">{t("subtitle")}</p>
          <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild className="h-12 w-full gap-2 bg-white px-6 text-[15px] font-semibold text-violet-700 hover:bg-white/90 sm:w-auto">
              <Link href="/register">
                {t("cta.signUp")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-12 w-full border border-white/25 px-6 text-[15px] font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <a href="#how-it-works">{t("cta.howItWorks")}</a>
            </Button>
          </div>
        </div>

        {nextMatch && (
          <TiltCard maxTilt={4} className="hidden w-full lg:block">
            <FeaturedMatchCard match={nextMatch} isLoggedIn={false} />
          </TiltCard>
        )}
      </div>
    </section>
  );
}
