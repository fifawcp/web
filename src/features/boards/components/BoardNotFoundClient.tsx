"use client";

import { useEffect } from "react";
import { AlertCircle, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { removeLastVisitedBoardId } from "@/features/boards/utils/boardStorage";
import { Button } from "@/shared/components/ui/button";

interface BoardNotFoundClientProps {
  globalBoardId: string;
}

export function BoardNotFoundClient({ globalBoardId }: BoardNotFoundClientProps) {
  const t = useTranslations("boards.errors");
  const router = useRouter();

  useEffect(() => {
    removeLastVisitedBoardId();
  }, []);

  const handleGoToGlobalBoard = () => {
    router.push(`/boards/${globalBoardId}`);
  };

  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900 animate-appear">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">{t("notFound")}</h1>
          <p className="text-muted-foreground text-lg">{t("notFoundDescription")}</p>
        </div>
        <Button onClick={handleGoToGlobalBoard} size="lg" className="w-full sm:w-auto">
          <Home className="h-5 w-5" />
          {t("goToGlobalBoard")}
        </Button>
      </div>
    </div>
  );
}
