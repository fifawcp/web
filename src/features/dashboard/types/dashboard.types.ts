import type { LocalizedName, Match, Team } from "@/features/schedule/types/schedule.types";

export type { LocalizedName, Match, Team };

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
  competition_name: string;
  entries: LeaderboardEntry[];
};

export type DashboardLeaderboard = {
  pickem: CompetitionLeaderboard;
  match: CompetitionLeaderboard;
};

// Full consolidated response
export type DashboardData = {
  picked_champion: Team | null;
  stats: DashboardStats;
  next_match: Match | null;
  progress: DashboardProgress;
  leaderboard: DashboardLeaderboard;
};
