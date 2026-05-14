import type { LocalizedName, Team } from "@/features/schedule/types/schedule.types";

export type { LocalizedName, Team };

// GET /dashboard/stats
export type CompetitionUserStats = {
  competition_id: number;
  rank: number;
  points: number;
};

export type NextMatch = {
  id: number;
  kickoff_at: string;
  home_team: Team | null;
  away_team: Team | null;
};

export type DashboardStats = {
  picked_champion: Team | null;
  pickem: CompetitionUserStats;
  match: CompetitionUserStats;
  next_match: NextMatch | null;
};

// GET /matches/pick-progress
export type MatchPickProgress = {
  made: number;
  total: number;
};

// GET /pickems — only the subset needed for dashboard display
export type StepProgress = {
  completed: number;
  total: number;
  is_complete: boolean;
};

export type PickemProgress = {
  groups: StepProgress;
  best_thirds: StepProgress;
  bracket: StepProgress;
};

export type UserPickemSummary = {
  progress: PickemProgress;
  is_locked: boolean;
};

// Tournament Awards — mocked until endpoint is available
export type TournamentAward = {
  id: string;
  name: string;
  picked: boolean;
  player: string | null;
};

export type TournamentAwards = {
  golden_boot: TournamentAward;
  golden_glove: TournamentAward;
  golden_ball: TournamentAward;
  young_player: TournamentAward;
};

// GET /dashboard/leaderboard
export type BoardMemberRole = "owner" | "admin" | "member";

export type BoardMember = {
  board_id: number;
  user_id: string;
  role: BoardMemberRole;
  created_at: string;
  username: string;
};

export type LeaderboardEntry = {
  rank: number;
  points: number;
  member: BoardMember;
};

export type CompetitionLeaderboard = {
  competition_id: number;
  entries: LeaderboardEntry[];
};

export type DashboardLeaderboard = {
  pickem: CompetitionLeaderboard;
  match: CompetitionLeaderboard;
};

// Static tournament stats — hardcoded config, not from API
export type TournamentStats = {
  totalMatches: number;
  groupMatches: number;
  knockoutMatches: number;
  teams: number;
};
