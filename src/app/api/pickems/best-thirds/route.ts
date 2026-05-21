import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PICKEMS_CACHE_TAG } from "@/features/pickems/api/pickems";

const UPSTREAM = process.env.BACKEND_API_URL;

export async function PUT(req: NextRequest) {
  const auth = req.headers.get("authorization");

  const response = await fetch(`${UPSTREAM}/api/pickems/best-thirds`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
    body: await req.text(),
  });

  if (response.ok) revalidateTag(PICKEMS_CACHE_TAG, { expire: 0 });

  if (response.status === 204 || response.status === 205 || response.status === 304) {
    return new NextResponse(null, { status: response.status });
  }

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
