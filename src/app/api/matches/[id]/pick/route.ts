import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";

const UPSTREAM = process.env.BACKEND_API_URL;

// Proxies the upstream PUT and busts the matches fetch cache on success so the
// schedule RSC reflects the new pick on the next render
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = req.headers.get("authorization");

  const response = await fetch(`${UPSTREAM}/api/matches/${id}/pick`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
    body: await req.text(),
  });

  if (response.ok) {
    // `{ expire: 0 }` forces immediate expiry
    revalidateTag(MATCHES_CACHE_TAG, { expire: 0 });
  }

  if (response.status === 204 || response.status === 205 || response.status === 304) {
    return new NextResponse(null, { status: response.status });
  }

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
