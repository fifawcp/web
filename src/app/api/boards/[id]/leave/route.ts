import { NextRequest } from "next/server";

import { BOARDS_LIST_TAG } from "@/features/boards/api/boards";
import { boardLeaderboardsTag } from "@/features/competitions/api/competitions";

import { proxyToBackend } from "../../../_lib/proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  // Leaving drops the member from every competition leaderboard preview other members still see.
  return proxyToBackend(req, { path: `/api/boards/${id}/leave`, method: "DELETE", revalidate: [BOARDS_LIST_TAG, boardLeaderboardsTag(Number(id))] });
}
