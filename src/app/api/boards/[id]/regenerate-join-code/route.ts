import { NextRequest } from "next/server";

import { boardTag } from "@/features/boards/api/boards";

import { proxyToBackend } from "../../../_lib/proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, { path: `/api/boards/${id}/regenerate-join-code`, method: "POST", revalidate: [boardTag(Number(id))] });
}
