export type BoardPrivacy = "public" | "private" | "global";
export type BoardRole = "owner" | "admin" | "member";

export type BoardViewer = {
  role: BoardRole;
  joined_at: string;
};

export type BoardListItem = {
  id: number;
  name: string;
  privacy: BoardPrivacy;
  // The viewer's role in this board (used to filter boards where they can create competitions).
  // Optional so the client degrades gracefully against an API that predates this field.
  role?: BoardRole;
};

export type Board = {
  id: number;
  name: string;
  privacy: BoardPrivacy;
  join_code: string | null;
  member_count: number;
  competition_count: number;
  created_at: string;
  viewer: BoardViewer;
};

export type BoardMember = {
  user_id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: BoardRole;
  joined_at: string;
};

export type BoardMembersPage = {
  items: BoardMember[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
};

export type BoardMemberPreview = Pick<BoardMember, "user_id" | "username" | "first_name" | "last_name">;

export type BoardPreview = {
  name: string;
  privacy: BoardPrivacy;
  member_count: number;
  members: BoardMemberPreview[];
};

export type CreateBoardInput = {
  name: string;
};

export type JoinBoardInput = {
  join_code: string;
};

export type UpdateBoardInput = {
  name?: string;
};

export type UpdateMemberRoleInput = {
  role: Exclude<BoardRole, "owner">;
};
