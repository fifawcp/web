import { NextRequest } from "next/server";

import { BOARDS_LIST_TAG } from "@/features/boards/api/boards";
import { competitionsTag } from "@/features/competitions/api/competitions";

import { proxyToBackend } from "../../../_lib/proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, { path: `/api/boards/${id}/competitions`, method: "GET" });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, {
    path: `/api/boards/${id}/competitions`,
    method: "POST",
    revalidate: [competitionsTag(Number(id)), BOARDS_LIST_TAG],
  });
}
