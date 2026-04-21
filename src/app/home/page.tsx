"use client";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, LogOut, Calendar, Mail } from "lucide-react";
import { Button } from "@shared/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const t = useTranslations("dashboard");

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] bg-linear-to-br from-wc-red/10 via-white to-wc-orange/10 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto animate-appear">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gradient-primary">{t("welcomeBack")}</h1>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-wc-red to-wc-orange flex items-center justify-center text-white text-2xl font-bold">
                  {user.first_name[0]}
                  {user.last_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">@{user.username}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <Mail className="h-5 w-5 text-wc-red" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("email")}</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <User className="h-5 w-5 text-wc-orange" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("userId")}</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white font-mono">{user.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <Calendar className="h-5 w-5 text-wc-red" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("memberSince")}</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">{t("sessionActive")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
