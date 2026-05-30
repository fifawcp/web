"use client";

import { useState } from "react";

import { cn } from "@/shared/lib/utils";

import type { Player } from "../types/awards.types";

type Props = {
  player: Player;
  /** Pixel size of the round avatar. */
  size?: number;
  className?: string;
};

/** 2–3 letter fallback when no flag image is available. */
function initials(player: Player): string {
  const code = player.team?.fifa_code || player.nationality;
  if (code) return code.slice(0, 3).toUpperCase();
  const first = player.first_name?.[0] ?? player.name?.[0] ?? "";
  const last = player.last_name?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

/**
 * Round avatar showing the player's country flag. Replaces the initials in
 * the original mockup — the flag reads faster and ties the player to their
 * nation at a glance.
 *
 * Deliberately a plain <img>, not `next/image`: player/team data comes from
 * the upstream catalog and isn't guaranteed to use the single flag host/size
 * configured in `next.config` (`flagcdn.com/w320/**`). `next/image` *throws
 * synchronously during render* for an empty `src` or an unconfigured host —
 * which previously bubbled up to the route error boundary ("An unexpected
 * error occurred") the moment a player without a clean flag URL appeared in
 * the search results or got picked. A native <img> never throws; we fall back
 * to country initials when the URL is missing or fails to load.
 */
export function PlayerFlagAvatar({ player, size = 40, className }: Props) {
  const [failed, setFailed] = useState(false);
  const flagUrl = player.team?.flag_url;
  const showFlag = !!flagUrl && !failed;

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border/60", className)}
      style={{ width: size, height: size }}
    >
      {showFlag ? (
        <img src={flagUrl} alt="" className="size-full object-cover" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <span className="font-semibold text-muted-foreground" style={{ fontSize: Math.max(9, size * 0.3) }}>
          {initials(player)}
        </span>
      )}
    </span>
  );
}
