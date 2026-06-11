import { NextRequest } from "next/server";

import { PICKEMS_CACHE_TAG } from "@/features/pickems/api/pickems";

import { proxyToBackend } from "../../_lib/proxy";

export async function PUT(req: NextRequest) {
  return proxyToBackend(req, { path: "/api/pickems/bracket", method: "PUT", revalidate: [PICKEMS_CACHE_TAG] });
}
