import { NextRequest } from "next/server";

import { proxyToBackend } from "../../../../../_lib/proxy";

type Ctx = { params: Promise<{ id: string; competitionId: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id, competitionId } = await params;
  return proxyToBackend(req, { path: `/api/boards/${id}/competitions/${competitionId}/leaderboard`, method: "GET" });
}
