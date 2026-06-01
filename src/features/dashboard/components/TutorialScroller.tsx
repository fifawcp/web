"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";

import { tutorialScrollerAnimation } from "../animations/tutorialScroller.animations";
import { stepImageSrc, TUTORIAL_STEPS } from "../lib/tutorialSteps";

/**
 * Desktop scrollytelling tutorial. Layout, top to bottom:
 *
 *   - Pinned wrapper, `h-screen` with `pt-(--header-height)` so the
 *     sticky header (z-50) overlaps padding, never content.
 *   - `container` wrapper so the rounded stage shares the same
 *     horizontal padding as every other section on the page.
 *   - Rounded stage (`bg-black`, `overflow-hidden`) holds three layers:
 *       1. Header strip — section title + step counter; persistent
 *          across all 6 steps so the user always knows where they are.
 *       2. Image layer — `object-contain` so the whole screenshot is
 *          visible; cross-swap horizontally between steps.
 *       3. Text card — content-sized, anchored to the bottom-left of
 *          the stage; rises over the image, fades out, then the image
 *          swaps to the next step.
 *
 * Mobile users get `TutorialMobile` instead — pinned scroll is fragile
 * on touch devices, so this view stays `md:block` only.
 */
export function TutorialScroller({ isLoggedIn }: { isLoggedIn: boolean }) {
  const t = useTranslations("dashboard.tutorial");
  const locale = useLocale();

  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<HTMLDivElement[]>([]);
  const imageRefs = useRef<HTMLDivElement[]>([]);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !pinnedRef.current) return;

    return tutorialScrollerAnimation({
      container: containerRef.current,
      pinned: pinnedRef.current,
      texts: textRefs.current,
      images: imageRefs.current,
      scrollHint: scrollHintRef.current,
      totalSteps: TUTORIAL_STEPS.length,
    });
  }, []);

  return (
    <div ref={containerRef} id="tutorial-start" className="relative hidden md:block">
      <div ref={pinnedRef} className="relative h-screen overflow-hidden pt-(--header-height)">
        <div className="container h-full">
          <div className="relative h-full overflow-hidden rounded-xl border border-border bg-zinc-900 dark:bg-black">
            {/* Persistent header strip — title + counter visible during
                the entire scrollytelling so the user always has context. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 bg-linear-to-b from-black/70 to-transparent px-6 py-4 lg:px-8 lg:py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{t("title")}</p>
              <p className="text-xs font-medium tabular-nums text-white/70">{t("subtitle")}</p>
            </div>

            {/* Scroll cue — sits centred near the top of the stage so
                it's unmistakable when the user first lands here. The
                GSAP timeline fades it out *before* step 1's text card
                rises, so the user reads the cue → scrolls → step 1
                copy comes in. Bounce is CSS, the fade-out is scrubbed. */}
            <div ref={scrollHintRef} className="pointer-events-none absolute inset-x-0 top-[18%] z-20 flex flex-col items-center gap-3 text-white" aria-hidden="true">
              <span className="text-sm font-semibold uppercase tracking-[0.32em] text-white drop-shadow-lg">{t("scrollHint")}</span>
              <ChevronDown className="size-20 animate-bounce drop-shadow-lg" strokeWidth={1.5} />
            </div>

            {/* Image layer — `object-contain` keeps the full screenshot
                visible regardless of the stage's aspect ratio. */}
            <div className="absolute inset-0">
              {TUTORIAL_STEPS.map((step, i) => (
                <div
                  key={step.key}
                  ref={(el) => {
                    if (el) imageRefs.current[i] = el;
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden={i === 0 ? undefined : true}
                >
                  {/* Plain <img> for now — the screenshots are static webp
                      under /public/tutorial and `next/image` would only buy
                      us responsive `srcset`, which adds complexity for very
                      little benefit at this fixed display size. Each image
                      is ~25–80KB after optimisation. */}
                  <img
                    src={stepImageSrc(locale, i)}
                    alt={t(`steps.${step.key}.title`)}
                    className="size-full object-contain opacity-40"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
              ))}
            </div>

            {/* Text card overlay — anchored to the stage's bottom-left
                with safe insets so it never escapes the rounded frame. */}
            <div className="pointer-events-none absolute inset-0 z-10">
              {TUTORIAL_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isLast = i === TUTORIAL_STEPS.length - 1;
                return (
                  <div
                    key={step.key}
                    ref={(el) => {
                      if (el) textRefs.current[i] = el;
                    }}
                    className="pointer-events-auto absolute bottom-6 left-6 right-6 max-w-2xl rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl shadow-black/40 lg:bottom-8 lg:left-8 lg:right-8 lg:p-6"
                    aria-hidden={i === 0 ? undefined : true}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-page-accent text-sm font-bold text-white shadow-sm">
                          {t(`steps.${step.key}.step`)}
                        </span>
                        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background">
                          <Icon className="size-4 text-page-accent-strong" />
                        </span>
                      </div>
                      <h3 className="text-xl font-bold tracking-tight lg:text-2xl">{t(`steps.${step.key}.title`)}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{t(`steps.${step.key}.description`)}</p>
                      {isLast && !isLoggedIn && (
                        <div className="pt-1">
                          <Button asChild className="bg-page-accent text-white hover:bg-page-accent/90">
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
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
