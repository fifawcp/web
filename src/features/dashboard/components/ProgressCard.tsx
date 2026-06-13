import { Check, GitBranch, Lock, type LucideIcon, Target, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { ProgressCardState, ProgressCardStatus } from "../lib/progressCardState";

import { CardReveal } from "./CardReveal";
import { ProgressRing } from "./ProgressRing";

const CATEGORY_ICONS: Record<ProgressCardState["id"], LucideIcon> = {
  bracket: GitBranch,
  matchPicks: Target,
  awards: Trophy,
};

const STATUS_BADGE: Record<ProgressCardStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  inProgress: "bg-page-accent-soft text-page-accent-strong",
  done: "border border-lime-500/30 bg-lime-500/15 text-lime-700 dark:text-lime-400",
  locked: "bg-muted text-muted-foreground",
};

const STATUS_RING: Record<ProgressCardStatus, string> = {
  todo: "text-muted-foreground/50",
  inProgress: "text-page-accent",
  done: "text-lime-600 dark:text-lime-400",
  locked: "text-lime-600 dark:text-lime-400",
};

const STATUS_CTA: Record<ProgressCardStatus, "start" | "continue" | "review" | "picks"> = {
  todo: "start",
  inProgress: "continue",
  done: "review",
  locked: "picks",
};

type Props = {
  state: ProgressCardState;
  isLoggedIn: boolean;
  delay?: number;
};

export async function ProgressCard({ state, isLoggedIn, delay }: Props) {
  const t = await getTranslations("dashboard.progress");
  const Icon = CATEGORY_ICONS[state.id];
  const isLocked = state.status === "locked";
  const recap = isLocked ? state.recap : null;

  // Guests see the category as a "way to play": icon, blurb, and a sign-up CTA.
  if (!isLoggedIn) {
    return (
      <CardReveal delay={delay} className="opacity-0 gap-3 bg-card p-4">
        <CategoryName icon={Icon} title={t(`${state.id}.title`)} />
        <p className="flex-1 text-xs leading-snug text-muted-foreground">{t(`${state.id}.blurb`)}</p>
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/register">{t("cta.start")}</Link>
        </Button>
      </CardReveal>
    );
  }

  const ring = (
    <ProgressRing
      value={recap ? recap.correct_picks : state.completed}
      total={recap ? Math.max(recap.scored_picks, 1) : state.total}
      className={cn("shrink-0", STATUS_RING[state.status])}
    >
      <RingCenter state={state} />
    </ProgressRing>
  );

  const badge = (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-2xs font-medium", STATUS_BADGE[state.status])}>
      {isLocked && <Lock className="size-2.5" aria-hidden />}
      {t(`status.${state.status}`)}
    </span>
  );

  const heading = (
    <>
      <CategoryName icon={Icon} title={t(`${state.id}.title`)} />
      <p className="text-xs leading-snug text-muted-foreground">{t(`${state.id}.blurb`)}</p>
    </>
  );

  const footer = (
    <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
        {recap
          ? recap.scored_picks > 0
            ? t("recap.correct", { correct: recap.correct_picks, scored: recap.scored_picks })
            : t("recap.noneScored")
          : t(`${state.id}.count`, { completed: state.completed, total: state.total })}
      </span>
      {state.status === "inProgress" || state.status === "todo" ? (
        <Button asChild size="sm" className="bg-page-accent text-white hover:bg-page-accent/90">
          <Link href={state.href}>{t(`cta.${STATUS_CTA[state.status]}`)}</Link>
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={state.href}>{t(`cta.${STATUS_CTA[state.status]}`)}</Link>
        </Button>
      )}
    </div>
  );

  return (
    <CardReveal delay={delay} className="opacity-0 gap-3 bg-card p-4">
      {/* Mobile: ring + heading on a row, then a full-width footer (divider spans the card) */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex items-center gap-3">
          {ring}
          <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">{heading}</div>
            {badge}
          </div>
        </div>
        {footer}
      </div>

      {/* Desktop: vertical stack */}
      <div className="hidden flex-1 flex-col gap-3 sm:flex">
        <div className="flex items-start justify-between">
          {ring}
          {badge}
        </div>
        <div className="flex flex-1 flex-col gap-1">{heading}</div>
        {footer}
      </div>
    </CardReveal>
  );
}

function CategoryName({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="text-sm font-semibold leading-tight">{title}</span>
    </div>
  );
}

function RingCenter({ state }: { state: ProgressCardState }) {
  if (state.status === "done") return <Check className="size-5 text-lime-600 dark:text-lime-400" aria-hidden />;

  if (state.status === "locked" && state.recap) {
    return (
      <span className="flex flex-col items-center leading-none">
        <span className="text-sm font-bold tabular-nums">{state.recap.points}</span>
        <span className="text-2xs uppercase text-muted-foreground">pts</span>
      </span>
    );
  }

  return (
    <span className="text-xs font-bold tabular-nums">
      {state.percent}
      <span className="text-2xs font-medium text-muted-foreground">%</span>
    </span>
  );
}
