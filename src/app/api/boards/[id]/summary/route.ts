import { NextRequest } from "next/server";

import { proxyToBackend } from "../../../_lib/proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(req, { path: `/api/boards/${id}/summary`, method: "GET" });
}
