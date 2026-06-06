"use client";

import { useMemo } from "react";
import { Trophy } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

import {
  FINAL_MATCH_ID,
  QF_LEFT_ORDER,
  QF_RIGHT_ORDER,
  QF_VISUAL_ORDER,
  R16_LEFT_ORDER,
  R16_RIGHT_ORDER,
  R16_VISUAL_ORDER,
  R32_LEFT_ORDER,
  R32_RIGHT_ORDER,
  R32_VISUAL_ORDER,
  SF_LEFT_ORDER,
  SF_RIGHT_ORDER,
  SF_VISUAL_ORDER,
  THIRD_PLACE_MATCH_ID,
} from "../lib/bracketStructure";
import type { BracketMatchCompare, BracketMatchSlot, BracketStageCode } from "../types/pickems.types";

import { BracketCenterCard } from "./BracketCenterCard";
import { BracketMatchCard } from "./BracketMatchCard";

type Props = {
  bracket: BracketMatchSlot[];
  champion: BracketMatchSlot["picked_team"];
  disabled?: boolean;
  /** Omitted on the read-only `/bracket` page. */
  onPick?: (matchId: number, fifaCode: string) => void;
  /** Read-only compare overlay keyed by match id. Present in `/bracket` compare mode. */
  comparisonById?: ReadonlyMap<number, BracketMatchCompare>;
};

type Side = "left" | "right";
type OutgoingKind = "pair-top" | "pair-bottom" | "straight" | "none";
type ConnectorPad = "md" | "sm";
type ByIdMap = Map<number, BracketMatchSlot>;

export function BracketDesktop(props: Props) {
  const byId = useMemo(() => new Map(props.bracket.map((slot) => [slot.match_id, slot] as const)), [props.bracket]);

  return (
    <>
      <BracketCompactView {...props} byId={byId} />
      <BracketSplitView {...props} byId={byId} />
    </>
  );
}

// =============================================================================
// Compact view — 1024px ≤ width < 1280px. All five rounds laid out left to
// right; the right rail carries the read-only Champion display + the
// Third-Place match card.
// =============================================================================

type ColumnSpec = {
  stage: BracketStageCode;
  matchIds: readonly number[];
  /** Each match cell spans this many of the 16 grid rows. */
  rowSpan: number;
};

const COMPACT_COLUMNS: ColumnSpec[] = [
  { stage: "round_of_32", matchIds: R32_VISUAL_ORDER, rowSpan: 1 },
  { stage: "round_of_16", matchIds: R16_VISUAL_ORDER, rowSpan: 2 },
  { stage: "quarterfinals", matchIds: QF_VISUAL_ORDER, rowSpan: 4 },
  { stage: "semifinals", matchIds: SF_VISUAL_ORDER, rowSpan: 8 },
  { stage: "final", matchIds: [FINAL_MATCH_ID], rowSpan: 16 },
];

function BracketCompactView({ champion, disabled, onPick, comparisonById, byId }: Props & { byId: ByIdMap }) {
  const tRounds = useTranslations("pickems.bracket.rounds");
  const t = useTranslations("pickems.bracket");
  const locale = useLocale();

  const finalSlot = byId.get(FINAL_MATCH_ID) ?? null;
  const thirdSlot = byId.get(THIRD_PLACE_MATCH_ID) ?? null;

  return (
    <div className="hidden lg:block xl:hidden">
      <div className="mb-3 grid grid-cols-5">
        {COMPACT_COLUMNS.map((col, colIdx) => {
          const completed = col.matchIds.reduce((n, id) => (byId.get(id)?.picked_team ? n + 1 : n), 0);
          const hasIncoming = colIdx > 0;
          const hasOutgoing = colIdx < COMPACT_COLUMNS.length - 1;
          return (
            <header
              key={col.stage}
              className={cn(
                "flex flex-col items-center gap-0.5 font-mono text-2xs uppercase tracking-wider text-muted-foreground",
                hasIncoming && "pl-5",
                hasOutgoing && "pr-5"
              )}
            >
              <span className="truncate">{tRounds(col.stage)}</span>
              <span className="tabular-nums opacity-60">
                {completed}/{col.matchIds.length}
              </span>
              <span aria-hidden className="mt-1 h-px w-full bg-border" />
            </header>
          );
        })}
      </div>

      <div className="grid grid-cols-5 grid-rows-[repeat(16,minmax(2.75rem,1fr))]">
        {/* Cols 1-4 (R32 → SF) render as normal grid cells with connectors. */}
        {COMPACT_COLUMNS.slice(0, 4).map((col, colIdx) =>
          col.matchIds.map((id, matchIdx) => {
            const slot = byId.get(id);
            if (!slot) return null;
            const isTopOfPair = matchIdx % 2 === 0;
            return (
              <BracketGridCell
                key={id}
                colStart={colIdx + 1}
                rowStart={matchIdx * col.rowSpan + 1}
                rowSpan={col.rowSpan}
                side="left"
                hasIncoming={colIdx > 0}
                outgoing={isTopOfPair ? "pair-top" : "pair-bottom"}
              >
                <BracketMatchCard
                  slot={slot}
                  density="dense"
                  disabled={disabled}
                  onPick={onPick ? (code) => onPick(id, code) : undefined}
                  comparison={comparisonById?.get(id) ?? null}
                  className="w-full"
                />
              </BracketGridCell>
            );
          })
        )}

        {/* Col 5 mirrors the xl center column — Final, Champion, Third stacked
            so every card across the bracket shares the same R32 width. */}
        <div className="flex flex-col justify-center gap-3 px-1.5" style={{ gridColumnStart: 5, gridRow: "1 / span 16" }}>
          <BracketCenterCard slot={finalSlot} label={tRounds("final")} disabled={disabled} onPick={onPick} comparison={comparisonById?.get(FINAL_MATCH_ID) ?? null} />
          <BracketChampionDisplay champion={champion} label={t("champion")} locale={locale} />
          <BracketCenterCard
            slot={thirdSlot}
            label={tRounds("third_place")}
            disabled={disabled}
            onPick={onPick}
            comparison={comparisonById?.get(THIRD_PLACE_MATCH_ID) ?? null}
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Split view — width ≥ 1280px. The bracket folds in half around a center
// column containing the Final (with trophy) and the Third-Place match. Left
// arm flows right (R32 → SF), right arm flows left (R32 ← SF).
// =============================================================================

type SplitColumn = {
  stage: BracketStageCode;
  side: "left" | "right";
  matchIds: readonly number[];
  rowSpan: number;
  colStart: number;
};

const SPLIT_COLUMNS: SplitColumn[] = [
  { stage: "round_of_32", side: "left", matchIds: R32_LEFT_ORDER, rowSpan: 2, colStart: 1 },
  { stage: "round_of_16", side: "left", matchIds: R16_LEFT_ORDER, rowSpan: 4, colStart: 2 },
  { stage: "quarterfinals", side: "left", matchIds: QF_LEFT_ORDER, rowSpan: 8, colStart: 3 },
  { stage: "semifinals", side: "left", matchIds: SF_LEFT_ORDER, rowSpan: 16, colStart: 4 },
  // Center column (5) is rendered separately.
  { stage: "semifinals", side: "right", matchIds: SF_RIGHT_ORDER, rowSpan: 16, colStart: 6 },
  { stage: "quarterfinals", side: "right", matchIds: QF_RIGHT_ORDER, rowSpan: 8, colStart: 7 },
  { stage: "round_of_16", side: "right", matchIds: R16_RIGHT_ORDER, rowSpan: 4, colStart: 8 },
  { stage: "round_of_32", side: "right", matchIds: R32_RIGHT_ORDER, rowSpan: 2, colStart: 9 },
];

// Nine equal columns, no grid gap. Each cell carries a uniform 6px
// horizontal padding (`px-1.5`); the connector stubs and L-shapes live
// inside this padding, on either side of the card. Cards across every
// column get the same width (~125px at xl).
const SPLIT_GRID_COLS = "grid-cols-9";

function BracketSplitView({ champion, disabled, onPick, comparisonById, byId }: Props & { byId: ByIdMap }) {
  const tRounds = useTranslations("pickems.bracket.rounds");
  const t = useTranslations("pickems.bracket");
  const locale = useLocale();

  const finalSlot = byId.get(FINAL_MATCH_ID) ?? null;
  const thirdSlot = byId.get(THIRD_PLACE_MATCH_ID) ?? null;

  return (
    <div className="hidden xl:block">
      <div className={cn("mb-3 grid", SPLIT_GRID_COLS)}>
        {SPLIT_COLUMNS.map((col) => {
          const completed = col.matchIds.reduce((n, id) => (byId.get(id)?.picked_team ? n + 1 : n), 0);
          return (
            <RoundHeader
              key={`${col.stage}-${col.side}`}
              label={tRounds(col.stage)}
              completed={completed}
              total={col.matchIds.length}
              colStart={col.colStart}
              align="center"
            />
          );
        })}
        {/* Center header — explicit gridRow keeps it on row 1; otherwise the
            sparse placement algorithm pushes it to row 2 because the cursor
            has already advanced past column 5. */}
        <RoundHeader label={tRounds("final")} completed={finalSlot?.picked_team ? 1 : 0} total={1} colStart={5} gridRow={1} align="center" />
      </div>

      <div className={cn("grid grid-rows-[repeat(16,minmax(2.75rem,1fr))]", SPLIT_GRID_COLS)}>
        {SPLIT_COLUMNS.map((col) =>
          col.matchIds.map((id, matchIdx) => {
            const slot = byId.get(id);
            if (!slot) return null;
            const isSingleton = col.matchIds.length === 1;
            const isTopOfPair = matchIdx % 2 === 0;
            const outgoing: OutgoingKind = isSingleton ? "straight" : isTopOfPair ? "pair-top" : "pair-bottom";
            const isOutermost = col.colStart === 1 || col.colStart === 9;
            return (
              <BracketGridCell
                key={id}
                colStart={col.colStart}
                rowStart={matchIdx * col.rowSpan + 1}
                rowSpan={col.rowSpan}
                side={col.side}
                hasIncoming={!isOutermost}
                outgoing={outgoing}
                pad="sm"
              >
                <BracketMatchCard
                  slot={slot}
                  density="dense"
                  disabled={disabled}
                  onPick={onPick ? (code) => onPick(id, code) : undefined}
                  comparison={comparisonById?.get(id) ?? null}
                  className="w-full"
                />
              </BracketGridCell>
            );
          })
        )}

        {/* Center column — Final sits first (top of the stack), then Champion
            (the apex below Final), then Third place. `px-1.5` mirrors the
            bracket cells so every card has the same width. */}
        <div className="flex flex-col justify-center gap-3 px-1.5" style={{ gridColumnStart: 5, gridRow: "1 / span 16" }}>
          <BracketCenterCard slot={finalSlot} label={tRounds("final")} disabled={disabled} onPick={onPick} comparison={comparisonById?.get(FINAL_MATCH_ID) ?? null} />
          <BracketChampionDisplay champion={champion} label={t("champion")} locale={locale} />
          <BracketCenterCard
            slot={thirdSlot}
            label={tRounds("third_place")}
            disabled={disabled}
            onPick={onPick}
            comparison={comparisonById?.get(THIRD_PLACE_MATCH_ID) ?? null}
          />
        </div>
      </div>
    </div>
  );
}

type RoundHeaderProps = {
  label: string;
  completed: number | null;
  total: number | null;
  colStart: number;
  gridRow?: number;
  align?: "left" | "right" | "center";
};

/**
 * Two-line header for each round column — label on top, count below in a
 * lighter weight. Stacking avoids the truncation that long names like
 * "QUARTERFINALS" hit at xl widths. Alignment mirrors the bracket side:
 * left arm reads left-to-right, right arm right-to-left, center centered.
 */
function RoundHeader({ label, completed, total, colStart, gridRow, align = "left" }: RoundHeaderProps) {
  const itemsClass = align === "right" ? "items-end" : align === "center" ? "items-center" : "items-start";
  return (
    <header
      className={cn("flex min-w-0 flex-col gap-0.5 px-1.5 font-mono uppercase tracking-wider text-muted-foreground", itemsClass)}
      style={{ gridColumnStart: colStart, gridRowStart: gridRow }}
    >
      <span className="truncate text-2xs">{label}</span>
      {completed !== null && total !== null && (
        <span className="text-2xs tabular-nums opacity-60">
          {completed}/{total}
        </span>
      )}
      <span aria-hidden className="mt-1 h-px w-full bg-border" />
    </header>
  );
}

type ChampionDisplayProps = {
  champion: Team | null;
  label: string;
  locale: string;
};

/**
 * Always-rendered "Champion" slot in the center column. Same `min-h` filled vs.
 * empty so picking the champion swaps content without nudging Final / Third.
 */
function BracketChampionDisplay({ champion, label, locale }: ChampionDisplayProps) {
  if (!champion) {
    return (
      <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-card px-2 py-2.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">{label}</span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-md border-2 bg-card px-2 py-2.5",
        "border-amber-400/70 dark:border-amber-500/50",
        "animate-in fade-in zoom-in-95 duration-500"
      )}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="flex size-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
          <Trophy className="size-3.5 text-amber-600 dark:text-amber-400" strokeWidth={2.25} aria-hidden />
        </div>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-500">{label}</span>
      </div>
      <div className="flex w-full flex-col items-center gap-1">
        <div className="overflow-hidden rounded-xs ring-1 ring-border/60">
          <Image src={champion.flag_url} alt="" width={28} height={20} sizes="28px" className="h-5 w-7 object-cover" />
        </div>
        <span className="max-w-full truncate text-sm font-semibold tracking-tight text-foreground">{getTeamName(champion, locale)}</span>
      </div>
    </div>
  );
}

// =============================================================================
// Shared cell wrapper with side-aware connector lines.
// =============================================================================

type CellProps = {
  colStart: number;
  rowStart: number;
  rowSpan: number;
  side: Side;
  hasIncoming: boolean;
  outgoing: OutgoingKind;
  /** "md" = pl-5/w-5 connectors (compact 5-col view). "sm" = pl-3/w-3 (tighter split view). */
  pad?: ConnectorPad;
  children: React.ReactNode;
};

/**
 * One match cell + connector lines to its neighbours.
 *
 * `py-1.5` shrinks the card so adjacent matches have a visible gap, while
 * leaving the cell itself flush — that way the connector L's still meet
 * exactly at the cell boundary (a grid `gap-y` would have introduced a real
 * gap and broken the connector continuity).
 *
 * `pad="sm"` (used by the xl split view) skips the incoming-side padding and
 * the incoming stub entirely — the previous column's L-shape already reaches
 * the boundary, so every cell ends up with one-sided padding (matching the
 * outermost R32 columns) and cards across all rounds get the same width.
 * `outgoing: "straight"` is used for singleton columns (SF in the split view)
 * where there's no paired match to bracket toward.
 */
function BracketGridCell({ colStart, rowStart, rowSpan, side, hasIncoming, outgoing, pad = "md", children }: CellProps) {
  const sm = pad === "sm";
  const hasOutgoing = outgoing !== "none";

  // Padding is applied to BOTH sides uniformly in sm mode so every card
  // (R32 outer or inner) ends up the same width. Source-side L-shape lives
  // in the cell's outgoing-side padding, destination-side stub lives in the
  // next cell's incoming-side padding — together they form a continuous
  // bracket connector across the 12px gap between two cards.
  const padX = sm ? "px-1.5" : "";
  const padL = sm ? "pl-1.5" : "pl-5";
  const padR = sm ? "pr-1.5" : "pr-5";
  const tailW = sm ? "w-1.5" : "w-5";
  const cornerTR = sm ? "rounded-tr-sm" : "rounded-tr-md";
  const cornerBR = sm ? "rounded-br-sm" : "rounded-br-md";
  const cornerTL = sm ? "rounded-tl-sm" : "rounded-tl-md";
  const cornerBL = sm ? "rounded-bl-sm" : "rounded-bl-md";

  return (
    <div
      className={cn("relative flex items-center py-1.5", sm ? padX : cn(hasIncoming && (side === "left" ? padL : padR), hasOutgoing && (side === "left" ? padR : padL)))}
      style={{
        gridColumnStart: colStart,
        gridRowStart: rowStart,
        gridRowEnd: `span ${rowSpan}`,
      }}
    >
      {children}

      {hasIncoming && <span aria-hidden className={cn("absolute top-1/2 h-px -translate-y-1/2 bg-border", tailW, side === "left" ? "left-0" : "right-0")} />}

      {outgoing === "pair-top" && (
        <span
          aria-hidden
          className={cn("absolute top-1/2 h-1/2 border-t border-border", tailW, side === "left" ? cn("right-0 border-r", cornerTR) : cn("left-0 border-l", cornerTL))}
        />
      )}

      {outgoing === "pair-bottom" && (
        <span
          aria-hidden
          className={cn("absolute top-0 h-1/2 border-b border-border", tailW, side === "left" ? cn("right-0 border-r", cornerBR) : cn("left-0 border-l", cornerBL))}
        />
      )}

      {outgoing === "straight" && <span aria-hidden className={cn("absolute top-1/2 h-px -translate-y-1/2 bg-border", tailW, side === "left" ? "right-0" : "left-0")} />}
    </div>
  );
}
