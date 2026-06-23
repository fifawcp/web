import type { LocalizedName, Match, Team, UserScorePick } from "@/features/schedule/types/schedule.types";

export type { LocalizedName, Match, Team, UserScorePick };

// ─── GET /dashboard — single consolidated payload ───────────────────────────
// Shape mirrors the backend response under `data` (see lib/ExampleRequest.json).

// stats.pickem / stats.match
export type CompetitionUserStats = {
  rank: number;
  points: number;
};

export type DashboardStats = {
  pickem: CompetitionUserStats;
  match: CompetitionUserStats;
};

// progress.* — every progress block shares this shape
export type StepProgress = {
  completed: number;
  total: number;
};

export type PickemProgress = {
  groups: StepProgress;
  best_thirds: StepProgress;
  bracket: StepProgress;
};

export type DashboardProgress = {
  match_picks: StepProgress;
  pickem: PickemProgress;
  awards: StepProgress;
};

//  leaderboard.pickem / leaderboard.match
export type BoardMemberRole = "admin" | "member";

export type LeaderboardMember = {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: BoardMemberRole;
  joined_at: string;
};

export type LeaderboardEntry = {
  rank: number;
  points: number;
  member: LeaderboardMember;
};

export type CompetitionLeaderboard = {
  competition_id: number;
  board_id: number;
  competition_name: string;
  entries: LeaderboardEntry[];
};

export type DashboardLeaderboard = {
  pickem: CompetitionLeaderboard;
  match: CompetitionLeaderboard;
};

// title_favorites — share of users who picked each team as champion
export type TitleFavorite = {
  team: Team;
  pick_count: number;
  pick_percent: number;
};

// recap.pickem / recap.awards — points earned in a locked category
export type CategoryRecap = {
  points: number;
  correct_picks: number;
  scored_picks: number;
};

export type DashboardRecap = {
  pickem: CategoryRecap;
  awards: CategoryRecap;
};

// The raw `next_match` the API may send: a single match (original shape), an array
// of simultaneous matches (post-change shape), or null. Normalized to Match[] at the
// fetch boundary via `normalizeNextMatches`, so consumers only ever see the array.
export type NextMatchPayload = Match | Match[] | null;

// Full consolidated response
// `title_favorites` and `recap` are optional until the API ships them.
export type DashboardData = {
  picked_champion: Team | null;
  stats: DashboardStats;
  // The upcoming match(es) sharing the earliest kickoff — usually one, but two (or
  // rarely more) matches can kick off simultaneously. Empty when nothing is upcoming.
  next_match: Match[];
  progress: DashboardProgress;
  leaderboard: DashboardLeaderboard;
  title_favorites?: TitleFavorite[];
  recap?: DashboardRecap;
};
