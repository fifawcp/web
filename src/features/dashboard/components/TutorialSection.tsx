"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Calendar, GitBranch, Settings, Sparkles, Trophy, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { tutorialSectionAnimation } from "../animations/tutorial.animations";

const TUTORIAL_STEPS = [
  { key: "createAccount", icon: UserPlus },
  { key: "joinOrCreateBoard", icon: Users },
  { key: "tournaments", icon: Trophy },
  { key: "customRules", icon: Settings },
  { key: "pickems", icon: GitBranch },
  { key: "schedule", icon: Calendar },
] as const;

export function TutorialSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const t = useTranslations("dashboard.guest.tutorial");

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const stepsRefs = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {
    if (!sectionRef.current || !titleRef.current || !subtitleRef.current) {
      return;
    }

    return tutorialSectionAnimation({
      container: sectionRef.current,
      title: titleRef.current,
      subtitle: subtitleRef.current,
      steps: stepsRefs.current,
      cta: ctaRef.current,
    });
  }, []);

  return (
    <section id="tutorial" ref={sectionRef} className="bg-muted/30 dark:bg-zinc-950 border-t border-border py-16 scroll-mt-20">
      <div className="flex flex-col items-center gap-12 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="opacity-0 text-3xl font-bold" ref={titleRef}>
            {t("title")}
          </h2>
          <p className="opacity-0 text-muted-foreground" ref={subtitleRef}>
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {TUTORIAL_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;
            return (
              <Card
                key={step.key}
                ref={(el) => {
                  if (el) stepsRefs.current[index] = el;
                }}
                size="sm"
                className={`opacity-0  flex flex-col md:flex-row items-stretch overflow-hidden ${isEven ? "" : "md:flex-row-reverse"}`}
              >
                {/* Image placeholder */}
                <div className="relative w-full md:w-48 h-32 md:h-auto shrink-0 bg-muted flex items-center justify-center">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-primary/5" />
                  <Icon className="size-12 text-muted-foreground/50" />
                </div>

                {/* Content */}
                <div className="flex flex-1 items-start gap-4 p-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {t(`steps.${step.key}.step`)}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-primary" />
                      <span className="font-semibold">{t(`steps.${step.key}.title`)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(`steps.${step.key}.description`)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {!isLoggedIn && (
          <div className="flex justify-center opacity-0" ref={ctaRef}>
            <Button asChild size="lg">
              <Link href="/register">
                <Sparkles className="size-4" />
                {t("cta")}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
