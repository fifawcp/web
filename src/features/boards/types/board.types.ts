export enum BoardRole {
  ADMIN = "admin",
  MEMBER = "member",
}

export interface Board {
  id: string;
  name: string;
  privacy: "public" | "private";
}

export interface BoardMember {
  correct_outcomes: number;
  exact_hits: number;

  match_score_points: number;
  pickem_points: number;
  total_points: number;

  joined_at: string;
  rank: number;
  role: BoardRole;
  updated_at: string;
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
}

export interface BoardViewer {
  is_owner: boolean;
  joined_at: string;
  rank: number;
  role: string;
  total_points: number;
}

export interface BoardDetails {
  id: string;
  name: string;
  privacy: "public" | "private";
  created_at: string;
  join_code?: string;
  owner_user_id?: string;
  viewer: BoardViewer;
}

export interface CreateBoardRequest {
  name: string;
}

export interface JoinBoardRequest {
  join_code: string;
}

export interface UpdateBoardRequest {
  name: string;
}

export interface UpdateMemberRoleRequest {
  role: BoardRole;
}
