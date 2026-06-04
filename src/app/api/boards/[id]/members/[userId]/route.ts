import { NextRequest } from "next/server";

import { boardMembersTag, boardTag } from "@/features/boards/api/boards";
import { boardLeaderboardsTag } from "@/features/competitions/api/competitions";

import { proxyToBackend } from "../../../../_lib/proxy";

type Ctx = { params: Promise<{ id: string; userId: string }> };

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id, userId } = await params;
  return proxyToBackend(req, {
    path: `/api/boards/${id}/members/${userId}`,
    method: "DELETE",
    // The removed member drops out of every competition's leaderboard preview, so bust those too.
    revalidate: [boardMembersTag(Number(id)), boardTag(Number(id)), boardLeaderboardsTag(Number(id))],
  });
}
