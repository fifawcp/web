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

// Full consolidated response
// `title_favorites` and `recap` are optional until the API ships them (see docs/api-requirements-dashboard.md).
export type DashboardData = {
  picked_champion: Team | null;
  stats: DashboardStats;
  next_match: Match | null;
  progress: DashboardProgress;
  leaderboard: DashboardLeaderboard;
  title_favorites?: TitleFavorite[];
  recap?: DashboardRecap;
};
