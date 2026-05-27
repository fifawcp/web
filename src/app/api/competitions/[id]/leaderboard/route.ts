import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: { code: "NOT_FOUND", message: "Use /api/boards/{boardId}/competitions/{competitionId}/leaderboard" } }, { status: 404 });
}
