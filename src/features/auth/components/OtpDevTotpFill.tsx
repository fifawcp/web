"use client";

import { useState } from "react";
import { getDevTotp } from "@/features/auth/api/client";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { isProd } from "@/lib/env";
import { ApiError } from "@/shared/lib/api/types";
import { cn } from "@/shared/lib/utils";

type ApiErrorLike = Pick<ApiError, "code"> | null | undefined;

type OtpDevTotpFillProps = {
  identifier: string;
  setOtpCode: (code: string) => void;
  onApiError?: (error: ApiErrorLike) => void;
  className?: string;
};

export function OtpDevTotpFill({ identifier, setOtpCode, onApiError, className }: OtpDevTotpFillProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (isProd) return null;

  const handleClick = async () => {
    if (!identifier || isLoading) return;
    setIsLoading(true);
    onApiError?.(null);

    const res = await getDevTotp(identifier);
    setIsLoading(false);

    if (!res.success) {
      onApiError?.(res.error);
      return;
    }

    const otp = res.data?.otp;
    if (!otp) {
      onApiError?.(undefined);
      return;
    }

    setOtpCode(otp);
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => void handleClick()}
      disabled={isLoading || !identifier}
      className={cn("absolute right-6 gap-2 text-xs font-medium", className)}
      aria-label="Fill verification code from dev endpoint"
    >
      <Badge variant="secondary" className="px-1.5 font-mono text-[10px] uppercase tracking-wide">
        dev
      </Badge>
      Fill
    </Button>
  );
}
