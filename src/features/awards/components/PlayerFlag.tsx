"use client";

import { useState } from "react";

import { cn } from "@/shared/lib/utils";

import type { Player } from "../types/awards.types";

type Props = {
  player: Player;
  /** Height in px. `rect` is 3:2 (width = height × 1.5); `circle` is square. */
  size?: number;
  /** `rect` (3:2) for list rows, `circle` for the chosen-pick hero. */
  shape?: "rect" | "circle";
  className?: string;
};

/** 2–3 letter fallback from the player's country code. */
function initials(player: Player): string {
  const code = player.team?.fifa_code;
  if (code) return code.slice(0, 3).toUpperCase();
  const first = player.first_name?.[0] ?? player.name?.[0] ?? "";
  const last = player.last_name?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

/**
 * Player's country flag — a 3:2 rectangle (list) or circle (chosen pick).
 * A plain <img> (not `next/image`, which throws on an empty/unconfigured src)
 * with a country-code fallback when the flag is missing.
 */
export function PlayerFlag({ player, size = 24, shape = "rect", className }: Props) {
  const [failed, setFailed] = useState(false);
  const flagUrl = player.team?.flag_url;
  const showFlag = !!flagUrl && !failed;

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted", shape === "circle" ? "rounded-full" : "rounded-xs", className)}
      style={{ height: size, width: shape === "circle" ? size : size * 1.5 }}
    >
      {showFlag ? (
        <img src={flagUrl} alt="" className="size-full object-cover" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <span className="font-semibold text-muted-foreground" style={{ fontSize: Math.max(9, size * 0.34) }}>
          {initials(player)}
        </span>
      )}
    </span>
  );
}
