import { getTranslations } from "next-intl/server";

import { GuestHeroStats, HeroCountdownBadge } from "./GuestHeroCountdown";
import { HeroCard } from "./HeroCard";

export async function GuestHero() {
  const t = await getTranslations("dashboard.hero");

  return <HeroCard badge={<HeroCountdownBadge />} primaryCta={{ href: "/register", label: t("cta.makeYourPicks") }} bottomContent={<GuestHeroStats />} />;
}
