import { ArrowRight, Target, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { BracketIcon } from "@/shared/icons/BracketIcon";
import { PodiumIcon } from "@/shared/icons/PodiumIcon";
import { Brand } from "@/shared/layout/Brand";

type FeatureKey = "knockout" | "scores" | "compete";

// Mix of bespoke (bracket/podium) and Lucide (target = "exact score").
// The two custom marks anchor the brand voice; Target keeps the middle row
// visually distinct from a generic calendar/check.
type FeatureIcon = LucideIcon | typeof BracketIcon;
const FEATURE_ICONS: Record<FeatureKey, FeatureIcon> = {
  knockout: BracketIcon,
  scores: Target,
  compete: PodiumIcon,
};

const FEATURES: readonly FeatureKey[] = ["knockout", "scores", "compete"] as const;

/**
 * Desktop-only brand panel for the `/login` and `/register` screens.
 *
 * Pure content — the stadium image and its overlay gradient live in the
 * auth layout as a full-bleed backdrop that spans the entire viewport.
 * That single-layer approach is what lets the seam between this panel and
 * the form fade cleanly into `background` in both themes; if the image
 * were scoped to this column we'd be fighting a hard column edge.
 *
 * The wrapper carries `dark` so the shared `<Brand />` lockup (which is
 * theme-aware) always renders its dark-mode skin — the backdrop is dark
 * in both themes by design, so the brand mark must follow suit.
 */
export async function AuthPanel() {
  const t = await getTranslations("auth.panel");

  return (
    <aside aria-label={t("brand")} className="dark relative z-10 hidden h-full flex-col p-10 text-white lg:flex">
      <Brand />

      <div className="my-auto flex flex-col gap-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h1 className="max-w-md text-4xl font-bold leading-[1.05] tracking-tight xl:text-5xl">
              {t("headlineLine1")}
              <br />
              {t("headlineLine2")}
            </h1>
            <p className="max-w-md text-base leading-relaxed text-white/75">{t("subtitle")}</p>
          </div>

          <Button
            asChild
            variant="ghost"
            className="h-11 self-start gap-2 rounded-md bg-white/10 px-6 font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm hover:bg-white/20 hover:text-white"
          >
            <Link href="/how-it-works">
              {t("explore")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <ul className="flex flex-col gap-5">
          {FEATURES.map((key) => {
            const Icon = FEATURE_ICONS[key];
            return (
              <li key={key} className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-sm">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold">{t(`features.${key}.title`)}</p>
                  <p className="max-w-xs text-sm leading-snug text-white/65">{t(`features.${key}.description`)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
