import { NextRequest } from "next/server";

import { boardMembersTag } from "@/features/boards/api/boards";

import { proxyToBackend } from "../../../../../_lib/proxy";

type Ctx = { params: Promise<{ id: string; userId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id, userId } = await params;
  return proxyToBackend(req, {
    path: `/api/boards/${id}/members/${userId}/role`,
    method: "PATCH",
    revalidate: [boardMembersTag(Number(id))],
  });
}
