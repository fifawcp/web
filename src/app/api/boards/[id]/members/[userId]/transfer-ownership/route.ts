import { NextRequest } from "next/server";

import { BOARDS_LIST_TAG, boardMembersTag, boardTag } from "@/features/boards/api/boards";

import { proxyToBackend } from "../../../../../_lib/proxy";

type Ctx = { params: Promise<{ id: string; userId: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id, userId } = await params;
  return proxyToBackend(req, {
    path: `/api/boards/${id}/members/${userId}/transfer-ownership`,
    method: "POST",
    revalidate: [boardMembersTag(Number(id)), boardTag(Number(id)), BOARDS_LIST_TAG],
  });
}
