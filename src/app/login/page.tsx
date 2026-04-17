"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/auth-layout";
import { FormInput } from "@/components/auth/form-input";
import { useLogin } from "@/hooks/use-login";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tLegal = useTranslations("auth.legal");
  const { formData, isSubmitting, handleChange, handleSubmit } = useLogin();

  return (
    <AuthLayout title={t("title")} subtitle={t("subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="email"
          label={t("email")}
          type="email"
          icon={Mail}
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="you@example.com"
          required
        />

        <FormInput
          id="password"
          label={t("password")}
          type="password"
          icon={Lock}
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => handleChange("rememberMe", e.target.checked)}
              className="h-4 w-4 text-wc-red focus:ring-wc-red border-zinc-300 dark:border-zinc-700 rounded"
            />
            <span className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">{t("rememberMe")}</span>
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-gradient-secondary hover:text-wc-orange">
            {t("forgotPassword")}
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
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
    </AuthLayout>
  );
}
