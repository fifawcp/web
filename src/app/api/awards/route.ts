import { NextRequest } from "next/server";

import { AWARDS_CACHE_TAG } from "@/features/awards/api/awards";

import { proxyToBackend } from "../_lib/proxy";

// GET and PUT share the `/api/awards` path, so this handler owns both. PUT
// busts the RSC fetch cache tag so the next server navigation to /awards
// reflects the saved picks. (GET from the client just proxies through; the
// server read uses `serverApi` directly with its own tagged cache.)
export async function GET(req: NextRequest) {
  return proxyToBackend(req, { path: "/api/awards", method: "GET" });
}

export async function PUT(req: NextRequest) {
  return proxyToBackend(req, { path: "/api/awards", method: "PUT", revalidate: [AWARDS_CACHE_TAG] });
}
