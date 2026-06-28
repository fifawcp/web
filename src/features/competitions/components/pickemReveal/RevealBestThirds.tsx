import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { getThirdPlacePillClass } from "@/features/standings/lib/comparison";
import type { ThirdPlaceAccuracy } from "@/features/standings/types/standings.types";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

import type { ThirdsReveal } from "../../lib/pickemRevealCompare";

type Props = {
  // The member's best-thirds picks — shown only when there's no standings table yet.
  picks: Team[];
  // The ranked twelve thirds, graded against the member's picks.
  reveal?: ThirdsReveal;
};

// Compact read-only best-thirds card. Mirrors the `/standings` third-place table:
// the twelve third-placed teams in rank order, the top eight advancing, with the
// member's pick shown as a ✓ / ✕ / — circle (✓ = an advancing team the member
// picked, i.e. the one that earned them points).
export function RevealBestThirds({ picks, reveal }: Props) {
  const locale = useLocale();
  const tReveal = useTranslations("competitions.memberPickem");

  if (reveal && reveal.rows.length > 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <ul>
          {reveal.rows.map((row) => (
            <li
              key={row.team.fifa_code}
              className={cn(
                "flex items-center gap-2 border-t border-border px-2 py-1 first:border-t-0",
                row.rank === reveal.qualifyingSlots + 1 && "border-t-2 border-dashed border-muted-foreground/40",
                !row.advances && "bg-muted/40 text-muted-foreground"
              )}
            >
              <span className={cn("w-4 text-center text-2xs font-semibold tabular-nums", row.advances ? "text-page-accent" : "text-muted-foreground")}>{row.rank}</span>
              <Image src={row.team.flag_url} alt="" width={20} height={14} className="h-3.5 w-5 shrink-0 rounded-xs object-cover" unoptimized />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{getTeamName(row.team, locale)}</span>
              {row.team.group_code ? <span className="shrink-0 font-mono text-2xs uppercase tracking-wider text-muted-foreground">{row.team.group_code}</span> : null}
              <PickCircle accuracy={row.accuracy} picked={row.picked} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Before the group stage ends — show the member's selections (no scoring yet).
  if (picks.length === 0) {
    return <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">{tReveal("thirdsEmpty")}</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <ul>
        {picks.map((team) => (
          <li key={team.fifa_code} className="flex items-center gap-2 border-t border-border px-2 py-1 first:border-t-0">
            <Image src={team.flag_url} alt="" width={20} height={14} className="h-3.5 w-5 shrink-0 rounded-xs object-cover" unoptimized />
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{getTeamName(team, locale)}</span>
            {team.group_code ? <span className="shrink-0 font-mono text-2xs uppercase tracking-wider text-muted-foreground">{team.group_code}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ✓ = picked & advanced (earned points), ✕ = picked but missed, — = not picked.
// Same circle + palette as the standings third-place "Pick" column.
function PickCircle({ accuracy, picked }: { accuracy: ThirdPlaceAccuracy; picked: boolean }) {
  return (
    <span className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-2xs font-semibold", getThirdPlacePillClass(accuracy))}>
      {picked ? (accuracy === "correct" ? "✓" : "✕") : "—"}
    </span>
  );
}
