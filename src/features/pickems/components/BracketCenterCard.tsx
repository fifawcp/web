"use client";

import type { BracketMatchSlot } from "../types/pickems.types";

import { BracketMatchCard } from "./BracketMatchCard";

type Props = {
  slot: BracketMatchSlot | null;
  /** Uppercase label shown in the ornament header (e.g. "Final", "Third place"). */
  label: string;
  disabled?: boolean;
  onPick: (matchId: number, fifaCode: string) => void;
};

/**
 * Final + Third-Place renderer for the xl split view. Same dense card body as
 * every other bracket cell; the topBar is a minimalist label with a thin
 * separator — no decorative iconography on either Final or Third Place.
 */
export function BracketCenterCard({ slot, label, disabled, onPick }: Props) {
  if (!slot) return null;

  return (
    <BracketMatchCard
      slot={slot}
      density="dense"
      disabled={disabled}
      onPick={(code) => onPick(slot.match_id, code)}
      topBar={
        <div className="flex items-center justify-center border-b border-border/60 px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          <span>{label}</span>
        </div>
      }
    />
  );
}
