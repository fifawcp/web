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
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* Desktop */}
        <div className="hidden w-full grid-cols-[1fr_auto_1fr] items-center gap-6 lg:grid">
          <Brand className="justify-self-start" />
          <div className="justify-self-center">
            <NavLinks variant="bar" />
          </div>

          <div className="flex items-center gap-2 justify-self-end">
            {user ? (
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
                <div role="separator" aria-orientation="vertical" className="h-6 w-px bg-border" />
                <PreferencesMenu />
              </>
            )}
          </div>
        </div>

        {/* Mobile — logo left, burger right. Identity + preferences live in the drawer. */}
        <div className="flex w-full items-center justify-between lg:hidden">
          <Brand />
          <MobileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
