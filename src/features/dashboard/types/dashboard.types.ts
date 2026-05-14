export type TournamentStats = {
  totalMatches: number;
  groupMatches: number;
  knockoutMatches: number;
  teams: number;
};

export type BoardMember = {
  rank: number;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  points: number;
  isCurrentUser: boolean;
};

export type TournamentRound = "group_stage" | "round_of_32" | "round_of_16" | "quarterfinals" | "semifinals" | "final";

export type UserDashboardStats = {
  predictedChampion: {
    teamCode: string;
    teamName: string;
    flagUrl: string;
  } | null;
  rank: number;
  totalMembers: number;
  bracketComplete: number;
  bracketTotal: number;
  nextRound: {
    name: TournamentRound;
    startsAt: string;
  } | null;
};

export type TopGlobal = BoardMember[];

export type PickStatusData = {
  currentBracketStep: number;
  gamesCount: number;
  gamesCountTotal: number;
  awardsPicked: number;
};
