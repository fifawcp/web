"use client";

import { MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";

import { useBoardPermissions } from "@/features/boards/hooks/useBoardPermissions";
import { BoardDetails, BoardMemberDetails } from "@/features/boards/types/board.types";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";

interface MemberActionsCellProps {
  board: BoardDetails;
  member: BoardMemberDetails;
  currentUserId: string;
  onUpdateRole: (userId: string, newRole: "admin" | "member") => Promise<void>;
  onRemoveMember?: (userId: string) => void;
}

export function MemberActionsCell({ board, member, currentUserId, onUpdateRole, onRemoveMember }: MemberActionsCellProps) {
  const t = useTranslations("boards.ranking");

  const { getMemberPermissions } = useBoardPermissions(board, currentUserId);
  const { memberIsAdmin, canRemove, canChangeRole, hasAnyAction } = getMemberPermissions(member.user_id, member.role);

  if (!hasAnyAction) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canChangeRole && (
          <DropdownMenuItem
            onClick={async () => {
              const newRole = memberIsAdmin ? "member" : "admin";
              await onUpdateRole(member.user_id, newRole);
            }}
          >
            {memberIsAdmin ? t("revokeAdmin") : t("makeAdmin")}
          </DropdownMenuItem>
        )}
        {canRemove && (
          <DropdownMenuItem onClick={() => onRemoveMember?.(member.user_id)} className="text-destructive">
            {t("removeMember")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
