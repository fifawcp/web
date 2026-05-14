import { getTranslations } from "next-intl/server";

import { GuestHeroBadge, GuestHeroStats } from "./GuestHeroCountdown";
import { HeroCard } from "./HeroCard";

export async function GuestHero() {
  const t = await getTranslations("dashboard.hero");

  return <HeroCard badge={<GuestHeroBadge />} primaryCta={{ href: "/register", label: t("cta.makeYourPicks") }} bottomContent={<GuestHeroStats />} />;
}
