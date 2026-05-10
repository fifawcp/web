import { BoardDetails, BoardMemberRole } from "@/features/boards/types/board.types";

/**
 * Hook for board permissions - derives permissions from board + currentUserId
 * No useMemo needed - calculations are trivial
 */
export function useBoardPermissions(board: BoardDetails, currentUserId: string) {
  const ownerId = board.owner_user_id || "";
  const currentUserRole = board.viewer.role;
  const isGlobalBoard = board.privacy === "public";

  // Current user's permissions
  const isOwner = board.viewer.is_owner;
  const isAdmin = currentUserRole === "admin";
  const canManage = isOwner || isAdmin;

  // Helper to check permissions for a specific member
  const getMemberPermissions = (memberId: string, memberRole: BoardMemberRole) => {
    const isCurrentUser = memberId === currentUserId;
    const memberIsOwner = memberId === ownerId;
    const memberIsAdmin = memberRole === "admin";

    const canRemove = !memberIsOwner && (isOwner || (isAdmin && !memberIsAdmin));
    const canChangeRole = !memberIsOwner && (isOwner || (isAdmin && !memberIsAdmin));
    return {
      isCurrentUser,
      memberIsOwner,
      memberIsAdmin,
      canRemove,
      canChangeRole,
      hasAnyAction: !isCurrentUser && (canRemove || canChangeRole),
    };
  };

  return {
    isOwner,
    isAdmin,
    canManage,
    isGlobalBoard,
    getMemberPermissions,
  };
}
