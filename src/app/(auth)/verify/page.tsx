"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { AuthCard } from "@features/auth";
import { useVerifyOtp } from "@features/auth/hooks/useVerifyOtp";
import { OtpInput } from "@features/auth/components/otp-input";

export default function VerifyOtpPage() {
  const t = useTranslations("auth.verifyOtp");
  const { setValue, handleSubmit, errors, errorType, isLoading } = useVerifyOtp();

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 text-center">{t("code")}</label>
          <OtpInput onChange={(value) => setValue("code", value)} error={errors.code} />
        </div>

        {errorType === "wrong_code" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{t("wrongCode")}</p>
          </div>
        )}

        {errorType === "too_many_attempts" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{t("tooManyAttempts")}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          <ShieldCheck className="h-5 w-5" />
          {t("submit")}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button type="button" className="text-sm font-medium text-gradient-secondary hover:text-wc-orange" disabled={isLoading}>
          {t("resend")}
        </button>
      </div>
    </AuthCard>
  );
}
