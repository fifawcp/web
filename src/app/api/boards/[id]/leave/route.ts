import { NextRequest } from "next/server";

import { BOARDS_LIST_TAG } from "@/features/boards/api/boards";

import { proxyToBackend } from "../../../_lib/proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, { path: `/api/boards/${id}/leave`, method: "DELETE", revalidate: [BOARDS_LIST_TAG] });
}
