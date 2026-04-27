"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { FloatingShape } from "@shared/components/ui/floating-shape";
import { Button } from "@shared/components/ui/old-button";
import { useScrollAnimation } from "@shared/hooks/useScrollAnimation";

export function BannerSection() {
  const t = useTranslations("home");
  const tCta = useTranslations("home.cta");
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div
        className="animate-appear-banner absolute inset-0 bg-cover bg-center bg-no-repeat [--banner-opacity:0.7] dark:[--banner-opacity:0.2]"
        style={{ backgroundImage: "url('/banner-stadium.png')" }}
      />

      {/* Colorful geometric shapes */}
      <FloatingShape color="red" size={128} opacity={20} blur="3xl" position={{ top: "5%", left: "25%" }} animation="float" animationDelay={0} />
      <FloatingShape color="orange" size={160} opacity={20} blur="3xl" position={{ top: "10%", right: "25%" }} animation="drift" animationDelay={1} />
      <FloatingShape color="red" shape="diamond" size={96} opacity={100} blur="3xl" position={{ bottom: "5%", left: "25%" }} animation="bounce" animationDelay={0.5} />
      <FloatingShape color="orange" size={144} opacity={100} blur="3xl" position={{ bottom: "10%", right: "25%" }} animation="wave" animationDelay={2} />
      <FloatingShape
        color="purple"
        size={192}
        opacity={10}
        blur="3xl"
        position={{ top: "25%", left: "50%" }}
        animation="pulse"
        animationDelay={1.5}
        className="-translate-x-1/2 -translate-y-1/2"
      />
      <FloatingShape
        color="purple"
        shape="square"
        size={72}
        opacity={15}
        darkOpacity={8}
        blur="2xl"
        position={{ top: "15%", left: "10%" }}
        animation="zigzag"
        animationDelay={0.8}
      />
      <FloatingShape
        color="red"
        shape="diamond"
        size={56}
        opacity={18}
        darkOpacity={10}
        blur="xl"
        position={{ bottom: "20%", right: "15%" }}
        animation="rotate"
        animationDuration={25}
      />
      <FloatingShape color="orange" size={88} opacity={12} darkOpacity={6} blur="3xl" position={{ top: "40%", right: "8%" }} animation="wave" animationDelay={1.2} />
      {/* End of colorful geometric shapes */}

      <div className="container relative z-10 flex items-center justify-center mx-auto min-h-[calc(100dvh-var(--header-height))]">
        <div className={`text-center max-w-3xl mx-2 sm:mx-auto ${isVisible ? "animate-appear-from-bottom" : "opacity-0"}`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 transition-all mb-6">
            {t("hero.title")} <span className="bg-gradient-secondary bg-clip-text text-transparent">{t("hero.titleHighlight")}</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-800 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">{t("hero.subtitle")}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mx-4 sm:mx-0">
            <Button asChild size="lg">
              <Link href="/register">{tCta("getStarted")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">{tCta("signIn")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
