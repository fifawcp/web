"use client";

import { Card, CardContent } from "@/shared/components/ui/card";

import { useBoardPermissionLost } from "../hooks/useBoardPermissionLost";
import type { Board } from "../types/boards.types";

import { ManageBoardMembers } from "./ManageBoardMembers";

type Props = {
  board: Board;
  currentUserId: string;
  enabled: boolean;
};

// The Members tab: the same member list + role management as the settings sheet, surfaced as a
// first-class board view. Non-managers see a read-only list (ManageBoardMembers gates the actions).
export function MembersTab({ board, currentUserId, enabled }: Props) {
  const onPermissionLost = useBoardPermissionLost(board.id);

  return (
    <Card size="sm">
      <CardContent>
        <ManageBoardMembers board={board} currentUserId={currentUserId} enabled={enabled} onPermissionLost={onPermissionLost} />
      </CardContent>
    </Card>
  );
}
