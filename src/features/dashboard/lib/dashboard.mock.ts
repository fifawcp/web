import type { DashboardLeaderboard, DashboardStats, MatchPickProgress, TournamentAwards, UserPickemSummary } from "../types/dashboard.types";

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  picked_champion: {
    fifa_code: "BRA",
    name: { en: "Brazil", es: "Brasil" },
    flag_url: "https://flagcdn.com/w320/br.png",
    group_code: "E",
  },
  pickem: { competition_id: 1, rank: 4, points: 152 },
  match: { competition_id: 2, rank: 7, points: 89 },
  next_match: {
    id: 42,
    kickoff_at: "2026-06-14T18:00:00Z",
    home_team: {
      fifa_code: "MEX",
      name: { en: "Mexico", es: "México" },
      flag_url: "https://flagcdn.com/w320/mx.png",
      group_code: "B",
    },
    away_team: {
      fifa_code: "CAN",
      name: { en: "Canada", es: "Canadá" },
      flag_url: "https://flagcdn.com/w320/ca.png",
      group_code: "B",
    },
  },
};

export const MOCK_MATCH_PICK_PROGRESS: MatchPickProgress = {
  made: 34,
  total: 104,
};

export const MOCK_USER_PICKEM_SUMMARY: UserPickemSummary = {
  progress: {
    groups: { completed: 12, total: 12, is_complete: true },
    best_thirds: { completed: 4, total: 4, is_complete: true },
    bracket: { completed: 8, total: 32, is_complete: false },
  },
  is_locked: false,
};

export const MOCK_TOURNAMENT_AWARDS: TournamentAwards = {
  golden_boot: { id: "golden_boot", name: "Golden Boot", picked: true, player: "Erling Haaland" },
  golden_glove: { id: "golden_glove", name: "Golden Glove", picked: true, player: "Alisson" },
  golden_ball: { id: "golden_ball", name: "Golden Ball", picked: false, player: null },
  young_player: { id: "young_player", name: "Best Young Player", picked: true, player: "Lamine Yamal" },
};

export const MOCK_DASHBOARD_LEADERBOARD: DashboardLeaderboard = {
  pickem: {
    competition_id: 1,
    entries: [
      { rank: 1, points: 187, member: { board_id: 1, user_id: "u1", role: "member", created_at: "2026-01-01T00:00:00Z", username: "alejandro_g" } },
      { rank: 2, points: 174, member: { board_id: 1, user_id: "u2", role: "member", created_at: "2026-01-01T00:00:00Z", username: "wei_c" } },
      { rank: 3, points: 168, member: { board_id: 1, user_id: "u3", role: "member", created_at: "2026-01-01T00:00:00Z", username: "mona_h" } },
      { rank: 4, points: 152, member: { board_id: 1, user_id: "u4", role: "owner", created_at: "2026-01-01T00:00:00Z", username: "julian_p" } },
      { rank: 5, points: 143, member: { board_id: 1, user_id: "u5", role: "member", created_at: "2026-01-01T00:00:00Z", username: "carlos_fc" } },
    ],
  },
  match: {
    competition_id: 2,
    entries: [
      { rank: 1, points: 95, member: { board_id: 1, user_id: "u3", role: "member", created_at: "2026-01-01T00:00:00Z", username: "mona_h" } },
      { rank: 2, points: 88, member: { board_id: 1, user_id: "u1", role: "member", created_at: "2026-01-01T00:00:00Z", username: "alejandro_g" } },
      { rank: 3, points: 82, member: { board_id: 1, user_id: "u5", role: "member", created_at: "2026-01-01T00:00:00Z", username: "carlos_fc" } },
      { rank: 4, points: 79, member: { board_id: 1, user_id: "u2", role: "member", created_at: "2026-01-01T00:00:00Z", username: "wei_c" } },
      { rank: 5, points: 74, member: { board_id: 1, user_id: "u4", role: "owner", created_at: "2026-01-01T00:00:00Z", username: "julian_p" } },
    ],
  },
};
