"use client";

import { ArrowRight, GitBranch, ListChecks, Lock, ShieldAlert, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { PickemProgress, Team } from "@/features/dashboard/types/dashboard.types";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type Props = {
  progress: PickemProgress | null;
  champion: Team | null;
  /** True once the tournament has kicked off — picks freeze, view becomes read-only. */
  isLocked: boolean;
};

type Stat = {
  id: "groups" | "thirds" | "bracket";
  icon: LucideIcon;
  completed: number;
  total: number;
};

/**
 * Two-mode pickem snapshot:
 *
 *   • **Editable (pre-tournament)** — three progress tiles + small champion
 *     plate + "Open pickem" CTA. Encourages the user to finish picks.
 *
 *   • **Locked (tournament live)** — champion takes centre stage on a
 *     full-bleed accent panel, with a compact summary line underneath.
 *     The progress tiles disappear because completion isn't actionable
 *     anymore; what matters is *what you locked in*, not *how far along
 *     you were*.
 */
export function PickemPeek({ progress, champion, isLocked }: Props) {
  const t = useTranslations("profile.pickemPeek");
  const locale = useLocale();

  const stats: Stat[] = [
    { id: "groups", icon: Lock, completed: progress?.groups.completed ?? 0, total: progress?.groups.total ?? 12 },
    { id: "thirds", icon: ListChecks, completed: progress?.best_thirds.completed ?? 0, total: progress?.best_thirds.total ?? 8 },
    { id: "bracket", icon: GitBranch, completed: progress?.bracket.completed ?? 0, total: progress?.bracket.total ?? 31 },
  ];

  const championName = champion?.name[locale] ?? champion?.name.en ?? null;

  return (
    <section aria-label={t("title")} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">{t("title")}</h2>
            {isLocked && <LockedPill label={t("lockedPill")} />}
          </div>
          <p className="text-xs text-muted-foreground">{isLocked ? t("subtitleLocked") : t("subtitle")}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto">
          <Link href="/pickems">
            {isLocked ? t("ctaLocked") : t("cta")}
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </header>

      {isLocked ? (
        <LockedView champion={champion} championName={championName} stats={stats} />
      ) : (
        <EditableView champion={champion} championName={championName} stats={stats} />
      )}
    </section>
  );
}

/* ─── Editable view ─────────────────────────────────────────────────── */

function EditableView({ champion, championName, stats }: { champion: Team | null; championName: string | null; stats: Stat[] }) {
  const t = useTranslations("profile.pickemPeek");
  return (
    <>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <li key={s.id}>
            <StatTile stat={s} label={t(`${s.id}Label`)} />
          </li>
        ))}
      </ul>
      <SmallChampionPlate champion={champion} championName={championName} />
    </>
  );
}

function StatTile({ stat, label }: { stat: Stat; label: string }) {
  const Icon = stat.icon;
  const percent = stat.total > 0 ? Math.min(100, (stat.completed / stat.total) * 100) : 0;
  const complete = stat.total > 0 && stat.completed >= stat.total;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-page-accent-soft text-page-accent-strong">
            <Icon className="size-3.5" />
          </div>
          <span className="truncate text-2xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <span className={cn("shrink-0 text-sm font-semibold tabular-nums", complete ? "text-page-accent-strong" : "text-foreground")}>
          {stat.completed}
          <span className="font-normal text-muted-foreground">/{stat.total}</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={stat.total || 1}
        aria-valuenow={stat.completed}
        aria-label={label}
        className="h-1 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-page-accent transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SmallChampionPlate({ champion, championName }: { champion: Team | null; championName: string | null }) {
  const t = useTranslations("profile.pickemPeek");

  if (!champion || !championName) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/80 bg-muted/30 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Trophy className="size-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("championLabel")}</span>
          <span className="text-sm leading-tight text-muted-foreground">{t("noChampion")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-page-accent/20 bg-page-accent-soft/40 p-3">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card ring-1 ring-border">
        <Image src={champion.flag_url} alt="" width={28} height={20} unoptimized className="h-5 w-7 rounded-xs object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-2xs font-medium uppercase tracking-wider text-page-accent-strong">{t("championLabel")}</span>
        <span className="truncate text-base font-bold leading-tight text-foreground">{championName}</span>
      </div>
      <Trophy aria-hidden className="size-5 shrink-0 text-page-accent-strong" />
    </div>
  );
}

/* ─── Locked view (championship trophy case feel) ───────────────────── */

function LockedView({ champion, championName, stats }: { champion: Team | null; championName: string | null; stats: Stat[] }) {
  return (
    <div className="flex flex-col gap-3">
      <HeroChampion champion={champion} championName={championName} />
      <SealedSummary stats={stats} />
    </div>
  );
}

/**
 * Full-bleed champion banner — the hero of the locked state. Mobile
 * centres the flag + name above the trophy badge; desktop spreads them
 * along a horizontal row. Falls back to a muted "bracket not finished"
 * card when the user never crowned a champion before the lock landed.
 */
function HeroChampion({ champion, championName }: { champion: Team | null; championName: string | null }) {
  const t = useTranslations("profile.pickemPeek");

  if (!champion || !championName) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center sm:flex-row sm:gap-4 sm:text-left">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShieldAlert className="size-5" />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold">{t("lockedNoChampionTitle")}</span>
          <span className="text-xs text-muted-foreground">{t("lockedNoChampionDescription")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-page-accent/40 bg-linear-to-br from-page-accent-soft via-page-accent-soft/60 to-card p-4 sm:p-5">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card ring-2 ring-page-accent/30 sm:size-16">
          <Image src={champion.flag_url} alt="" width={56} height={40} unoptimized className="h-9 w-12 rounded-sm object-cover sm:h-10 sm:w-14" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-page-accent-strong">{t("championLabel")}</span>
          <span className="truncate text-xl font-bold leading-tight text-foreground sm:text-2xl">{championName}</span>
        </div>
        <Trophy aria-hidden className="hidden size-7 shrink-0 text-page-accent-strong sm:block" />
      </div>
    </div>
  );
}

/**
 * One-line "what's in your locked pickem" summary. Plain text with `·`
 * separators wraps naturally on mobile — no 3-column grid means no
 * label truncation regardless of locale length.
 */
function SealedSummary({ stats }: { stats: Stat[] }) {
  const t = useTranslations("profile.pickemPeek");
  return (
    <p className="text-center text-xs text-muted-foreground sm:text-left">
      <span className="font-medium text-foreground tabular-nums">
        {stats[0].completed}/{stats[0].total}
      </span>{" "}
      {t("lockedGroupsLabel")}
      <Separator />
      <span className="font-medium text-foreground tabular-nums">
        {stats[1].completed}/{stats[1].total}
      </span>{" "}
      {t("lockedThirdsLabel")}
      <Separator />
      <span className="font-medium text-foreground tabular-nums">
        {stats[2].completed}/{stats[2].total}
      </span>{" "}
      {t("lockedBracketLabel")}
    </p>
  );
}

function Separator() {
  return (
    <span aria-hidden className="mx-1.5 text-muted-foreground/40">
      ·
    </span>
  );
}

/* ─── Shared bits ───────────────────────────────────────────────────── */

function LockedPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-page-accent/30 bg-page-accent-soft px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-page-accent-strong">
      <Lock className="size-3" />
      {label}
    </span>
  );
}
