"use client";

import { Check, ChevronDown, CircleDashed, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { ResolvedGroupPick } from "@/features/pickems/types/pickems.types";
import { getAccuracyPillClass } from "@/features/standings/lib/comparison";
import type { PickAccuracy } from "@/features/standings/types/standings.types";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

import type { GroupRevealData, GroupSummary } from "../../lib/pickemRevealCompare";

type Props = {
  group: ResolvedGroupPick;
  // Graded rows in actual order, once the group has results. Absent / un-decided →
  // the card shows the member's predicted order only (no scoring overlay).
  data?: GroupRevealData;
  // Controlled by the parent so an expand-all / collapse-all toggle can drive every
  // card; the header (group + points) always shows, the rows expand on demand.
  open: boolean;
  onToggle: () => void;
};

// Expandable read-only group card. The header always shows the group and — once
// scored — the points earned, mirroring `/standings` (minus the matchday). Expand
// to see the rows: actual finishing order with the member's pick as an
// accuracy-coloured position circle (green exact / amber top-2 / red miss / "—").
export function RevealGroupCard({ group, data, open, onToggle }: Props) {
  const t = useTranslations("standings");
  const tReveal = useTranslations("competitions.memberPickem");
  const locale = useLocale();
  const decided = data?.decided ?? false;
  const summary = data?.summary ?? null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
      >
        <span className="flex items-baseline gap-1.5">
          <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("groupLabel")}</span>
          <span className="text-sm font-bold leading-none text-page-accent">{group.group_code}</span>
        </span>
        <span className="flex items-center gap-2">
          {summary ? <PointsBadge summary={summary} label={tReveal("groupBadge", summary)} /> : null}
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
        </span>
      </button>

      <ul className={cn("border-t border-border", !open && "hidden")}>
        {decided
          ? data!.rows.map((row) => (
              <Row
                key={row.team.fifa_code}
                team={row.team}
                position={row.actualPosition}
                locale={locale}
                pick={{ predicted: row.predictedPosition, accuracy: row.accuracy }}
              />
            ))
          : group.teams.map((team, idx) => <Row key={team.fifa_code} team={team} position={idx + 1} locale={locale} badge={badgeFor(idx + 1)} />)}
      </ul>
    </div>
  );
}

// Correct positions + points earned, like the `/standings` group badge. A perfect
// group (every position exact) gets the lime tone and a star.
function PointsBadge({ summary, label }: { summary: GroupSummary; label: string }) {
  const isPerfect = summary.total > 0 && summary.correct === summary.total;
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-2xs font-semibold tabular-nums",
        isPerfect ? "border-lime-500/30 bg-lime-500/15 text-lime-700 dark:text-lime-400" : "border-border bg-muted text-muted-foreground"
      )}
    >
      {isPerfect ? "★ " : ""}
      {label}
    </span>
  );
}

function Row({
  team,
  position,
  locale,
  pick,
  badge,
}: {
  team: Team;
  position: number;
  locale: string;
  pick?: { predicted: number | null; accuracy: PickAccuracy };
  badge?: BadgeVariant | null;
}) {
  return (
    <li className="flex items-center gap-2 border-t border-border px-2 py-1 first:border-t-0">
      <span className="w-4 text-center text-2xs tabular-nums text-muted-foreground">{position}</span>
      <Image src={team.flag_url} alt="" width={20} height={14} className="h-3.5 w-5 shrink-0 rounded-xs object-cover" unoptimized />
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{getTeamName(team, locale)}</span>
      {pick ? (
        <span
          className={cn(
            "inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-2xs font-semibold tabular-nums",
            getAccuracyPillClass(pick.accuracy)
          )}
        >
          {pick.predicted ?? "—"}
        </span>
      ) : badge ? (
        <PositionBadge variant={badge} />
      ) : null}
    </li>
  );
}

type BadgeVariant = "qualify" | "third" | "out";

function badgeFor(position: number): BadgeVariant | null {
  if (position === 1 || position === 2) return "qualify";
  if (position === 3) return "third";
  if (position === 4) return "out";
  return null;
}

// Prediction-only badge in the data-accent palette — mirrors the editable picker.
function PositionBadge({ variant }: { variant: BadgeVariant }) {
  const t = useTranslations("pickems.groups.badges");
  return (
    <span role="img" aria-label={t(variant)} className="inline-flex size-5 items-center justify-center">
      {variant === "qualify" && <Check className="size-3.5 text-page-accent-strong" aria-hidden />}
      {variant === "third" && <CircleDashed className="size-3.5 text-page-accent-strong" aria-hidden />}
      {variant === "out" && <X className="size-3 text-muted-foreground/70" aria-hidden />}
    </span>
  );
}
