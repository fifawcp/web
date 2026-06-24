import { getTranslations } from "next-intl/server";

import { computeProgressCardStates } from "../lib/progressCardState";
import type { DashboardProgress, DashboardRecap } from "../types/dashboard.types";

import { CardReveal } from "./CardReveal";
import { ProgressCard } from "./ProgressCard";

type Props = {
  progress: DashboardProgress | null;
  recap: DashboardRecap | null;
  isLoggedIn: boolean;
  delay?: number;
};

const GUEST_PROGRESS: DashboardProgress = {
  match_picks: { completed: 0, total: 104 },
  pickem: {
    groups: { completed: 0, total: 12 },
    best_thirds: { completed: 0, total: 8 },
    bracket: { completed: 0, total: 31 },
  },
  awards: { completed: 0, total: 4 },
};

export async function ProgressCardsSection({ progress, recap, isLoggedIn, delay = 0 }: Props) {
  const t = await getTranslations("dashboard.progress");
  // Guests have no real progress (the API may return a partial object), so always seed the sample.
  const states = computeProgressCardStates(isLoggedIn && progress ? progress : GUEST_PROGRESS, recap);

  return (
    <section className="flex flex-col gap-3">
      <CardReveal bare delay={delay} className="opacity-0 flex flex-col gap-0.5">
        <h2 className="text-base font-semibold">{isLoggedIn ? t("title") : t("guestTitle")}</h2>
        <p className="text-xs text-muted-foreground">{isLoggedIn ? t("subtitle") : t("guestSubtitle")}</p>
      </CardReveal>
      <div className="grid gap-3 sm:grid-cols-3">
        {states.map((state, index) => (
          <ProgressCard key={state.id} state={state} isLoggedIn={isLoggedIn} delay={delay + 0.06 + index * 0.06} />
        ))}
      </div>
    </section>
  );
}
