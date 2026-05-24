"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { UserPickem } from "@/features/pickems/types/pickems.types";

import { standingsRevealAnimation } from "../animations/standings.animations";
import { useCompareView } from "../hooks/useCompareView";
import { useStandings } from "../hooks/useStandings";
import { buildBestThirdsSet, buildPickIndex } from "../lib/comparison";
import { groupAndEnrichStandings } from "../lib/groupStandings";
import { buildThirdPlaceStandings } from "../lib/thirdPlace";
import type { StandingRow } from "../types/standings.types";

import { CompareToggle } from "./CompareToggle";
import { ComparisonLegend } from "./ComparisonLegend";
import { GroupCard } from "./GroupCard";
import { ThirdPlaceCard } from "./ThirdPlaceCard";

type Props = {
  initialStandings: StandingRow[];
  /** The user's pickem, or null for guests / when the pickems fetch failed. */
  initialPickem: UserPickem | null;
  /** True when the user is authenticated but the pickems fetch failed. */
  pickemFailed: boolean;
  isAuthed: boolean;
};

export function StandingsView({ initialStandings, initialPickem, pickemFailed, isAuthed }: Props) {
  const t = useTranslations("standings");
  const { data: standings = [] } = useStandings(initialStandings);

  const [view, setView] = useCompareView(isAuthed);
  const comparing = view === "compare";

  // Derive the view models from the raw rows — same shape as ScheduleView.
  const groups = useMemo(() => groupAndEnrichStandings(standings), [standings]);
  const thirdPlace = useMemo(() => buildThirdPlaceStandings(groups), [groups]);
  // Always feed the pickem into compare mode. If groups are unlocked or the
  // user hasn't picked, `buildPickIndex` / `buildBestThirdsSet` return empty
  // structures so every row renders with the "not picked" pill.
  const pickIndex = useMemo(() => (comparing ? buildPickIndex(initialPickem) : null), [comparing, initialPickem]);
  const bestThirds = useMemo(() => (comparing ? buildBestThirdsSet(initialPickem) : null), [comparing, initialPickem]);

  // Pickems is optional — surface a fetch failure once, then fall back to the
  // guest standings. The ref guards against React StrictMode's double-mount.
  const toastShown = useRef(false);
  useEffect(() => {
    if (pickemFailed && !toastShown.current) {
      toastShown.current = true;
      toast.error(t("pickemError"));
    }
  }, [pickemFailed, t]);

  // Container that owns the staggered children. GSAP queries `[data-reveal]`
  // descendants so we can keep wrapping/layout flexible without prop-drilling
  // refs to every card.
  const revealRoot = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!revealRoot.current) return;
      const items = revealRoot.current.querySelectorAll<HTMLElement>("[data-reveal]");
      if (items.length === 0) return;
      return standingsRevealAnimation({ items });
    },
    // Re-run when the set of items changes (compare toggle adds/removes the
    // legend) so newly mounted nodes pick up the fade-in instead of popping.
    { dependencies: [comparing], scope: revealRoot }
  );

  return (
    <div ref={revealRoot} className="container mx-auto flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            <span aria-hidden className="size-1.5 rounded-full bg-page-accent" />
            {t("stageHeading")}
          </span>
          {isAuthed && <CompareToggle view={view} onChange={setView} />}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("description")}</p>
      </header>

      {comparing && (
        <div data-reveal>
          <ComparisonLegend />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <div key={g.group_code} data-reveal>
            <GroupCard group={g} pickIndex={pickIndex} />
          </div>
        ))}
      </div>

      <div data-reveal>
        <ThirdPlaceCard standings={thirdPlace} bestThirds={bestThirds} />
      </div>
    </div>
  );
}
