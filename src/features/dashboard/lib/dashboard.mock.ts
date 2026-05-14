import type { PickStatusData, TopGlobal, UserDashboardStats } from "../types/dashboard.types";

export const MOCK_USER_STATS: UserDashboardStats = {
  predictedChampion: {
    teamCode: "BRA",
    teamName: "Brazil",
    flagUrl: "https://flagcdn.com/w80/br.png",
  },
  rank: 4,
  totalMembers: 1289,
  bracketComplete: 24,
  bracketTotal: 48,
  nextRound: {
    name: "round_of_32",
    startsAt: "2026-06-27T12:00:00Z",
  },
};

export const MOCK_TOP_GLOBAL: TopGlobal = [
  { rank: 1, userId: "u1", username: "alejandro_g", firstName: "Alejandro", lastName: "Gómez", points: 187, isCurrentUser: false },
  { rank: 2, userId: "u2", username: "wei_c", firstName: "Wei", lastName: "Chen", points: 174, isCurrentUser: false },
  { rank: 3, userId: "u3", username: "mona_h", firstName: "Mona", lastName: "Hassan", points: 168, isCurrentUser: false },
  { rank: 4, userId: "u4", username: "julian_p", firstName: "Julian", lastName: "Pereira", points: 152, isCurrentUser: true },
  { rank: 5, userId: "u5", username: "carlos_fc", firstName: "Carlos", lastName: "Mendez", points: 143, isCurrentUser: false },
];

export const MOCK_PICK_STATUS: PickStatusData = {
  currentBracketStep: 2,
  gamesCount: 34,
  gamesCountTotal: 104,
  awardsPicked: 3,
};
