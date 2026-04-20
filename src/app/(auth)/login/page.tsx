"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, LogIn, AlertCircle } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { AuthCard, FormInput, useLogin } from "@features/auth";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tLegal = useTranslations("auth.legal");
  const { register, handleSubmit, errors, serverError, isLoading } = useLogin();

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {serverError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
          </div>
        )}
        <FormInput id="email" label={t("email")} type="email" icon={Mail} placeholder="you@example.com" error={errors.email} {...register("email")} />

        <Button type="submit" className="w-full" disabled={isLoading}>
          <LogIn className="h-5 w-5" />
          {t("submit")}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t("noAccount")}{" "}
          <Link href="/register" className="font-medium text-gradient-secondary hover:text-wc-orange">
            {t("createOne")}
          </Link>
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-500">
        {tLegal("bySigningIn")}{" "}
        <Link href="/terms" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
          {tLegal("termsOfService")}
        </Link>{" "}
        {tLegal("and")}{" "}
        <Link href="/privacy" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
          {tLegal("privacyPolicy")}
        </Link>
      </p>
    </AuthCard>
  );
}
