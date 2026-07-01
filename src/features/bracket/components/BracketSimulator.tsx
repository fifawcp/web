"use client";

import { useMemo } from "react";
import { RotateCcw, Share2, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { BracketTree } from "@/features/pickems/components/BracketTree";
import { findChampion } from "@/features/pickems/lib/projectBracket";
import { useMatches } from "@/features/schedule/hooks/useMatches";
import type { Match } from "@/features/schedule/types/schedule.types";
import { Button } from "@/shared/components/ui/button";

import { useShareBracket } from "../hooks/useShareBracket";
import { useSimulatorDraft } from "../hooks/useSimulatorDraft";
import { buildSimulatorBracket, countSimulatorEdits } from "../lib/simulatorBracket";

type Props = {
  initialMatches: Match[];
  /** Namespaces the sessionStorage draft; `undefined` for guests. */
  userId: string | undefined;
};

/**
 * Interactive "what-if" bracket. Seeds from the real tournament tree, lets the
 * user re-pick any winner from the Round of 32 onward, and recomputes every
 * downstream round live. Picks persist in sessionStorage (see `useSimulatorDraft`)
 * so the board survives navigating away and back within the session. Reuses the
 * Pick'ems `BracketTree` / projection wholesale; only the draft store differs.
 */
export function BracketSimulator({ initialMatches, userId }: Props) {
  const t = useTranslations("bracket.simulator");
  const { data: matches = initialMatches } = useMatches(initialMatches);
  const { draft, pick, reset } = useSimulatorDraft(userId);

  const projected = useMemo(() => buildSimulatorBracket(matches, draft), [matches, draft]);
  const champion = useMemo(() => findChampion(projected), [projected]);
  const edits = useMemo(() => countSimulatorEdits(matches, draft), [matches, draft]);

  const { share, isSharing } = useShareBracket(projected, champion);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wand2 className="size-4 shrink-0 text-page-accent" aria-hidden />
          <span>{t("disclaimer")}</span>
        </p>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="ghost" size="sm" onClick={reset} disabled={edits === 0} className="gap-1.5">
            <RotateCcw className="size-4" aria-hidden />
            {edits > 0 ? t("resetWithCount", { n: edits }) : t("reset")}
          </Button>
          <Button size="sm" onClick={share} disabled={isSharing} className="gap-1.5">
            <Share2 className="size-4" aria-hidden />
            {isSharing ? t("share.sharing") : t("share.button")}
          </Button>
        </div>
      </div>

      <BracketTree bracket={projected} champion={champion} onPick={pick} />
    </div>
  );
}
