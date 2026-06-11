import { ChevronRight, Flame } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { StageCode } from "@/shared/types/wcp.types";

import { getBannerContent } from "../lib/getBannerContent";

type Props = {
  stageCode: StageCode | null;
  isLoggedIn: boolean;
};

// One-line contextual nudge under the featured match.
export async function SlimBanner({ stageCode, isLoggedIn }: Props) {
  const t = await getTranslations("dashboard.banner");
  const { key, href } = getBannerContent(stageCode, isLoggedIn);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background text-page-accent-strong">
        <Flame className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-xs text-muted-foreground sm:text-sm">{t(key)}</span>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-page-accent-strong transition-colors hover:text-page-accent hover:underline sm:text-sm"
      >
        {t(`${key}Cta`)}
        <ChevronRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}
