import { Pagination } from "@/shared/lib/api/types";

export type BoardMemberRole = "admin" | "member";

// Match API: BoardPrivacy.
export type BoardPrivacy = "public" | "private";

export interface BoardSummary {
  id: string;
  name: string;
  privacy: BoardPrivacy;
}

export interface Board extends BoardSummary {
  owner_user_id?: string;
  join_code?: string;
  created_at: string;
}

export interface BoardViewer {
  is_owner: boolean;
  joined_at: string;
  rank: number;
  role: BoardMemberRole;
  total_points: number;
}
export interface BoardDetails extends Board {
  viewer: BoardViewer;
}

export interface BoardMemberDetails {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: BoardMemberRole;
  joined_at: string;
  updated_at: string;
  rank: number;
  total_points: number;
  pickem_points: number;
  match_score_points: number;
  exact_hits: number;
  correct_outcomes: number;
}

// ─── listing / filtering ───

// Sort options accepted by the members endpoint (Go: BoardMembersSort).
export type BoardMembersSort = "total_points" | "pickem_points" | "match_score_points" | "exact_hits" | "correct_outcomes";

// Query params for the members listing (Go: BoardMembersFilters).
export interface BoardMembersFilters {
  search?: string;
  sort?: BoardMembersSort;
}

// Re-export for callers so they don't have to import from two places.
export type { Pagination };

// ─── requests (unchanged) ───
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
  role: BoardMemberRole;
}
