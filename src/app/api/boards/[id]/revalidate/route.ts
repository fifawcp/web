import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { BOARDS_LIST_TAG, boardMembersTag, boardTag } from "@/features/boards/api/boards";

type Ctx = { params: Promise<{ id: string }> };

// Busts the board cache tags so a follow-up router.refresh() re-renders from a fresh fetch.
// The board fetch is tagged revalidate:30, so without this a plain refresh keeps the stale
// role — used when the client hits a 403 from a role change made in another session.
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const boardId = Number(id);

  if (Number.isFinite(boardId)) {
    revalidateTag(boardTag(boardId), { expire: 0 });
    revalidateTag(boardMembersTag(boardId), { expire: 0 });
  }
  revalidateTag(BOARDS_LIST_TAG, { expire: 0 });

  return new NextResponse(null, { status: 204 });
}
