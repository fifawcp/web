"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { removeLastVisitedBoardId } from "@/features/boards/utils/boardStorage";

const ERROR_MAP = {
  BOARD_NOT_FOUND: {
    title: "boardNotFound",
    description: "boardNotFoundDescription",
  },
  NOT_BOARD_MEMBER: {
    title: "notMember",
    description: "notMemberDescription",
  },
} as const;

export function BoardErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("boards.errors");

  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;

    const error = searchParams.get("error");
    if (!error || !(error in ERROR_MAP)) return;

    hasHandled.current = true;

    const config = ERROR_MAP[error as keyof typeof ERROR_MAP];

    removeLastVisitedBoardId();

    toast.error(t(config.title), {
      description: t(config.description),
    });

    // Preserve other params, remove only "error"
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");

    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname, t]);

  return null;
}
