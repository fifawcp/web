"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Board } from "@/features/boards/types/board.types";
import { getLastVisitedBoardId } from "@/features/boards/utils/boardStorage";

interface BoardRedirectProps {
  boards: Board[];
  fallbackBoardId: string;
}

export function BoardRedirect({ boards, fallbackBoardId }: BoardRedirectProps) {
  const router = useRouter();
  const t = useTranslations("boards");

  useEffect(() => {
    const targetBoardId = getLastVisitedBoardId(boards) || fallbackBoardId;
    router.replace(`/boards/${targetBoardId}`);
  }, [boards, fallbackBoardId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">{t("loading")}</p>
    </div>
  );
}
