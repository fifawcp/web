"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, User, UserPlus, AtSign, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { AuthCard, FormInput, useRegister } from "@/features/auth";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const { register, handleSubmit, errors, serverError, isLoading } = useRegister();

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {serverError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
          </div>
        )}
        <FormInput id="username" label={t("username")} type="text" icon={AtSign} placeholder="johndoe" error={errors.username} {...register("username")} />

        <div className="grid grid-cols-2 gap-4">
          <FormInput id="first_name" label={t("firstName")} type="text" icon={User} placeholder="John" error={errors.first_name} {...register("first_name")} />
          <FormInput id="last_name" label={t("lastName")} type="text" icon={User} placeholder="Doe" error={errors.last_name} {...register("last_name")} />
        </div>

        <FormInput id="email" label={t("email")} type="email" icon={Mail} placeholder="you@example.com" error={errors.email} {...register("email")} />

        <div>
          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 mt-1 text-wc-red focus:ring-wc-red border-zinc-300 dark:border-zinc-700 rounded"
              {...register("acceptTerms")}
            />
            <label htmlFor="terms" className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">
              {t("agreeToTerms")}{" "}
              <Link href="/terms" className="font-medium text-gradient-secondary hover:text-wc-orange">
                {t("termsOfService")}
              </Link>{" "}
              {t("and")}{" "}
              <Link href="/privacy" className="font-medium text-gradient-secondary hover:text-wc-orange">
                {t("privacyPolicy")}
              </Link>
            </label>
          </div>
          {errors.acceptTerms && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.acceptTerms}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          <UserPlus className="h-5 w-5" />
          {t("submit")}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-gradient-secondary hover:text-wc-orange">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
