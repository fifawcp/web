import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/shared/components/ui/button";

import { Brand } from "./Brand";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { PreferencesMenu } from "./PreferencesMenu";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const t = await getTranslations("nav");
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* Desktop */}
        <div className="relative hidden w-full items-center justify-between gap-6 md:flex">
          <Brand />
          <div className="absolute left-1/2 -translate-x-1/2">
            <NavLinks variant="bar" />
          </div>

          <div className="flex items-center gap-2">
            {!!user ? (
              <UserMenu username={user.username} firstName={user.first_name} lastName={user.last_name} />
            ) : (
              <>
                <div className="flex items-center">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">{t("login")}</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">{t("register")}</Link>
                  </Button>
                </div>
                <hr className="h-6 w-px bg-border" />
                <PreferencesMenu />
              </>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="grid w-full grid-cols-3 items-center md:hidden">
          <div className="justify-self-start">
            <MobileMenu isLoggedIn={!!user} user={user} />
          </div>
          <div className="justify-self-center">
            <Brand />
          </div>
          <div className="flex items-center gap-1 justify-self-end">
            {!!user ? (
              <>
                <UserMenu username={user.username} firstName={user.first_name} lastName={user.last_name} />
              </>
            ) : (
              <PreferencesMenu />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
