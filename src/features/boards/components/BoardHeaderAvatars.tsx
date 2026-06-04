"use client";

import { AvatarStack } from "@/shared/components/AvatarStack";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";

import { useBoardMembers } from "../hooks/useBoardMembers";
import type { Board } from "../types/boards.types";

type Props = {
  board: Board;
};

// Overlapping member avatars in the header. Fewer shown on mobile to leave room for the actions.
export function BoardHeaderAvatars({ board }: Props) {
  const isMobile = useIsMobile();
  const max = isMobile ? 4 : 6;
  const { data } = useBoardMembers(board.id, { page: 1, limit: 8 });

  if (!data) {
    return (
      <div className="flex items-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="-ml-1.5 size-9 rounded-full ring-2 ring-background first:ml-0" />
        ))}
      </div>
    );
  }

  return <AvatarStack members={data.items} total={board.member_count} max={max} size="md" tone="surface" />;
}
