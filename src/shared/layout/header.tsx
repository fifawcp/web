"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { LanguageToggle } from "@/shared/components/ui/language-toggle";
import { UserCard } from "@/shared/components/ui/user-card";
import { useAuthStore } from "@/features/auth/store/auth.store";

import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { WCPIcon } from "@/shared/icons/wcp-icon";
import { Button } from "@/shared/components/ui/button";

export function Header() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  const isActive = (path: string) => pathname === path;

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [isAuthenticated]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex  h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <WCPIcon width={32} height={32} fill="gradient" />
              <span className="text-gradient-secondary">WCP</span>
            </Link>

            {isLoggedIn && (
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/home"
                  className={`text-sm font-medium transition-colors hover:text-wc-red dark:hover:text-wc-orange ${
                    isActive("/home") ? "text-gradient-secondary" : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {t("home")}
                </Link>

                <Link
                  href="/boards"
                  className={`text-sm font-medium transition-colors hover:text-wc-red dark:hover:text-wc-orange ${
                    isActive("/boards") ? "text-gradient-secondary" : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {t("boards")}
                </Link>

                <Link
                  href="/leaderboard"
                  className={`text-sm font-medium transition-colors hover:text-wc-red dark:hover:text-wc-orange ${
                    isActive("/leaderboard") ? "text-gradient-secondary" : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {t("leaderboard")}
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />

            {isLoggedIn && user ? (
              <div className="hidden md:flex items-center ml-2">
                <UserCard username={user.username} points={0} firstName={user.first_name} lastName={user.last_name} />
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">{t("login")}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">{t("register")}</Link>
                </Button>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 py-4">
            <nav className="flex flex-col gap-4">
              {isLoggedIn ? (
                <>
                  {user && (
                    <div className="px-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                      <UserCard username={user.username} points={0} firstName={user.first_name} lastName={user.last_name} />
                    </div>
                  )}
                  <Link
                    href="/home"
                    className={`text-sm font-medium px-2 py-1 rounded-md ${
                      isActive("/home") ? "bg-wc-red/10 dark:bg-wc-purple/20 text-gradient-secondary" : "text-zinc-700 dark:text-zinc-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("home")}
                  </Link>
                  <Link
                    href="/boards"
                    className={`text-sm font-medium px-2 py-1 rounded-md ${
                      isActive("/boards") ? "bg-wc-red/10 dark:bg-wc-purple/20 text-gradient-secondary" : "text-zinc-700 dark:text-zinc-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("boards")}
                  </Link>
                  <Link
                    href="/leaderboard"
                    className={`text-sm font-medium px-2 py-1 rounded-md ${
                      isActive("/leaderboard") ? "bg-wc-red/10 dark:bg-wc-purple/20 text-gradient-secondary" : "text-zinc-700 dark:text-zinc-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("leaderboard")}
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline" onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/login">{t("login")}</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/register">{t("register")}</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
