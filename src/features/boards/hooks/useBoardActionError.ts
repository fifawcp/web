"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { API_ERROR_CODES, ApiClientError, translateApiError } from "@/shared/lib/api/errors";

// Error handler for board-management mutations. A FORBIDDEN means the viewer's role was revoked
// while the sheet was open — toast and hand off to onPermissionLost; else show the translated error.
export function useBoardActionError(onPermissionLost: () => void) {
  const tApiErrors = useTranslations("apiErrors");
  const tManage = useTranslations("boards.manage");

  return useCallback(
    (error: unknown) => {
      if (error instanceof ApiClientError && error.code === API_ERROR_CODES.FORBIDDEN) {
        toast.error(tManage("forbidden"));
        onPermissionLost();
        return;
      }
      toast.error(translateApiError(error, tApiErrors));
    },
    [tApiErrors, tManage, onPermissionLost]
  );
}
