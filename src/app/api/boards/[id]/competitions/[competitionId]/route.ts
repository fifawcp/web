import { NextRequest } from "next/server";

import { BOARDS_LIST_TAG, boardTag } from "@/features/boards/api/boards";
import { competitionsTag } from "@/features/competitions/api/competitions";

import { proxyToBackend } from "../../../../_lib/proxy";

type Ctx = { params: Promise<{ id: string; competitionId: string }> };

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id, competitionId } = await params;
  return proxyToBackend(req, {
    path: `/api/boards/${id}/competitions/${competitionId}`,
    method: "DELETE",
    revalidate: [competitionsTag(Number(id)), boardTag(Number(id)), BOARDS_LIST_TAG],
  });
}
