import { NextRequest } from "next/server";

import { BOARDS_LIST_TAG, boardTag } from "@/features/boards/api/boards";

import { proxyToBackend } from "../../_lib/proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, { path: `/api/boards/${id}`, method: "GET" });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, { path: `/api/boards/${id}`, method: "PATCH", revalidate: [boardTag(Number(id)), BOARDS_LIST_TAG] });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, { path: `/api/boards/${id}`, method: "DELETE", revalidate: [BOARDS_LIST_TAG] });
}
