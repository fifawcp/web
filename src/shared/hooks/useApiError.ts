import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { ApiError } from "@/shared/lib/api/types";

const UNKNOWN_API_ERROR_CODE = "UNKNOWN_ERROR";

type ApiErrorLike = Pick<ApiError, "code"> | null | undefined;

export function useApiError() {
  const t = useTranslations();
  const [error, setError] = useState<ApiErrorLike>(null);

  const message = useMemo(() => {
    if (!error) return null;

    const code = error.code ?? UNKNOWN_API_ERROR_CODE;
    const key = `apiErrors.${code}`;

    if (typeof t.has === "function" && t.has(key)) return t(key);

    return t(`apiErrors.${UNKNOWN_API_ERROR_CODE}`);
  }, [error, t]);

  const set = useCallback((nextError?: ApiErrorLike) => {
    setError(nextError ?? null);
  }, []);

  const clear = useCallback(() => {
    setError(null);
  }, []);

  return {
    message,
    set,
    clear,
  };
}
