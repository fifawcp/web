import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Board, BoardDetails, BoardMember } from "@/features/boards";
import { BoardDetailsView } from "@/features/boards/components/BoardDetailsView";
import { BoardNotFoundClient } from "@/features/boards/components/BoardNotFoundClient";
import { NotBoardMemberClient } from "@/features/boards/components/NotBoardMemberClient";
import { Button } from "@/shared/components/ui/button";
import { serverApi } from "@/shared/lib/api/server";

interface BoardDetailsPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardDetailsPage({ params }: BoardDetailsPageProps) {
  const { boardId } = await params;

  const t = await getTranslations("boards");
  const session = await getServerSession(authOptions);

  const boardRes = await serverApi.get<BoardDetails>(`/api/boards/${boardId}`);
  const boardsRes = await serverApi.get<Board[]>(`/api/boards`);
  const membersRes = await serverApi.get<BoardMember[]>(`/api/boards/${boardId}/members`);

  if (!boardRes.success || !boardRes.data || !boardsRes.success || !boardsRes.data || !membersRes.success || !membersRes.data || !membersRes.pagination) {
    const errorCode = boardRes.error?.code || membersRes.error?.code;
    const globalBoard = boardsRes.data?.find((b) => b.privacy === "public");

    if (errorCode === "BOARD_NOT_FOUND" && globalBoard) {
      return <BoardNotFoundClient globalBoardId={globalBoard.id} />;
    }

    if (errorCode === "NOT_BOARD_MEMBER" && globalBoard) {
      return <NotBoardMemberClient globalBoardId={globalBoard.id} />;
    }

    return (
      <div className="min-h-[calc(100dvh-var(--header-height))] flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t("errors.errorOccurred")}</h1>
            <p className="text-muted-foreground">{boardRes.error?.message || membersRes.error?.message || t("errors.errorOccurredDescription")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/boards">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                {t("back")}
              </Button>
            </Link>
            {globalBoard && (
              <Link href={`/boards/${globalBoard.id}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  {t("errors.goToGlobalBoard")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] animate-appear bg-zinc-50 dark:bg-zinc-900">
      <BoardDetailsView
        board={boardRes.data}
        boards={boardsRes.data}
        initialMembers={membersRes.data}
        initialPagination={membersRes.pagination}
        currentUserId={session?.user?.id ?? "user-001"}
        boardId={boardId}
      />
    </div>
  );
}
