"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { tutorialSectionAnimation } from "../animations/tutorial.animations";
import { stepImageSrc, TUTORIAL_STEPS } from "../lib/tutorialSteps";

/**
 * Mobile-only tutorial — the original 6-card alternating layout with a
 * stagger reveal on scroll-in. Desktop users get `TutorialScroller`
 * instead (pinned scrollytelling). Both views read from the same
 * `TUTORIAL_STEPS` config so step copy stays in sync.
 */
export function TutorialMobile({ isLoggedIn }: { isLoggedIn: boolean }) {
  const t = useTranslations("dashboard.tutorial");
  const locale = useLocale();

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const stepsRefs = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {
    if (!sectionRef.current || !titleRef.current || !subtitleRef.current) return;

    return tutorialSectionAnimation({
      container: sectionRef.current,
      title: titleRef.current,
      subtitle: subtitleRef.current,
      steps: stepsRefs.current,
      cta: ctaRef.current,
    });
  }, []);

  return (
    <div ref={sectionRef} className="md:hidden">
      <div className="container relative z-10 flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 ref={titleRef} className="text-3xl font-bold opacity-0">
            {t("title")}
          </h2>
          <p ref={subtitleRef} className="text-muted-foreground opacity-0">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          {TUTORIAL_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.key}
                ref={(el) => {
                  if (el) stepsRefs.current[index] = el;
                }}
                size="sm"
                className="flex flex-col items-stretch overflow-hidden opacity-0"
              >
                <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-t-lg bg-zinc-900">
                  <img
                    src={stepImageSrc(locale, index)}
                    alt={t(`steps.${step.key}.title`)}
                    className="size-full object-contain opacity-90"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="flex flex-1 items-start gap-4 p-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-page-accent text-sm font-bold text-white">
                    {t(`steps.${step.key}.step`)}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-page-accent-strong" />
                      <span className="font-semibold">{t(`steps.${step.key}.title`)}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{t(`steps.${step.key}.description`)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {!isLoggedIn && (
          <div ref={ctaRef} className="flex justify-center opacity-0">
            <Button asChild size="lg" className="bg-page-accent text-white hover:bg-page-accent/90">
              <Link href="/register">
                <Sparkles className="size-4" />
                {t("cta")}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
