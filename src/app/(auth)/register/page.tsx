"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, User, UserPlus } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { AuthCard, FormInput, useRegister } from "@features/auth";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const { formData, isLoading, handleChange, handleSubmit } = useRegister();

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          id="name"
          label={t("fullName")}
          type="text"
          icon={User}
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="John Doe"
          required
        />

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
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => handleChange("acceptTerms", e.target.checked)}
            className="h-4 w-4 mt-1 text-wc-red focus:ring-wc-red border-zinc-300 dark:border-zinc-700 rounded"
            required
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
