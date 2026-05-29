import type { Team } from "@/shared/types/wcp.types";

/** `domain.AwardType` — the four individual honors, in canonical order. */
export type AwardType = "golden_boot" | "golden_ball" | "golden_glove" | "young_player";

/** `domain.PlayerPosition` enum. */
export type PlayerPosition = "goalkeeper" | "defender" | "midfielder" | "attacker";

/** `domain.PlayerClub` — the player's domestic club (logo + name). */
export type PlayerClub = {
  name: string;
  logo_url: string;
};

/**
 * `domain.Player`. `team` reuses the shared `Team` shape (same
 * `fifa_code` / `flag_url` / localized `name` fields the rest of the app
 * already renders), so the country flag pulls from `team.flag_url` exactly
 * like `GroupTeamRow` / `MatchCard`.
 */
export type Player = {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  photo_url: string;
  position: PlayerPosition;
  team: Team;
  club: PlayerClub;
};

/** `domain.StepProgress` — shared shape across pickems/awards. */
export type StepProgress = {
  completed: number;
  total: number;
};

/**
 * `domain.ResolvedAwardPick` — one award slot. GET /awards returns one slot
 * **per award type** in canonical order, so `player` is `null` for the slots
 * the user hasn't picked yet. (Mapping these null slots straight into the PUT
 * body was the source of the "Cannot read properties of null" crash.)
 */
export type ResolvedAwardPick = {
  award_type: AwardType;
  player: Player | null;
};

/** A pick that's actually filled — `player` narrowed to non-null. */
export type FilledAwardPick = ResolvedAwardPick & { player: Player };

/** `domain.UserAwards` — GET /awards response and PUT /awards response. */
export type UserAwards = {
  is_locked: boolean;
  picks: ResolvedAwardPick[];
  progress: StepProgress;
};

/** `dtos.AwardPickDto` — one entry in the PUT body. */
export type AwardPickInput = {
  award_type: AwardType;
  player_id: number;
};

/** `dtos.SaveAwardPicksDto` — PUT /awards body (0..4 entries, unique award_type). */
export type SaveAwardPicksPayload = {
  picks: AwardPickInput[];
};

/** Filters for GET /players. All optional; combine with AND server-side. */
export type PlayerQuery = {
  /** Case-insensitive substring across name / first_name / last_name. */
  q?: string;
  positions?: PlayerPosition[];
  team_fifa_codes?: string[];
  /** 1-based. */
  page?: number;
  /** Page size, backend max 100. */
  limit?: number;
};

/** Normalized GET /players result — the data array plus the paginator's `has_more`. */
export type PlayerSearchResult = {
  players: Player[];
  hasMore: boolean;
};
