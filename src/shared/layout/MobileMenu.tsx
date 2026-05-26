"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Globe, LogOut, Palette } from "lucide-react";
import { useTranslations } from "next-intl";

import { logoutAndSignOut } from "@/features/auth/lib/logout";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/shared/components/ui/drawer";
import { HamburgerIcon } from "@/shared/icons/HamburgerIcon";
import { patchReleasePointerCapture } from "@/shared/lib/patch-pointer-capture";
import { getInitials } from "@/shared/lib/ui";

import { Brand } from "./Brand";
import { NavLinks } from "./NavLinks";
import { LanguageSwitch, ThemeSwitch } from "./PreferenceControls";

type SessionUser = {
  username: string;
  first_name: string;
  last_name: string;
};

type MobileMenuProps = {
  user?: SessionUser;
};

const sectionLabel = "text-2xs font-medium uppercase tracking-wider text-muted-foreground";

export function MobileMenu({ user }: MobileMenuProps) {
  const t = useTranslations("nav");
  const tUser = useTranslations("userMenu");
  const tPref = useTranslations("preferences");
  const tLang = useTranslations("language");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Workaround for a vaul ≤ 1.1.2 mobile drag bug — see patch-pointer-capture.ts.
  useEffect(() => {
    patchReleasePointerCapture();
  }, []);

  const close = () => setOpen(false);

  const handleSignOut = async () => {
    setLoading(true);
    await logoutAndSignOut("/");
  };

  const fullName = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username : "";

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left" noBodyStyles>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("openMenu")}
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
      >
        <HamburgerIcon open={false} />
      </button>
      <DrawerContent className="data-[vaul-drawer-direction=left]:w-80">
        <DrawerTitle className="sr-only">{t("menuLabel")}</DrawerTitle>
        <DrawerDescription className="sr-only">{t("menuDescription")}</DrawerDescription>

        {/* Header — Brand + close */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <Brand onClick={close} />
          <DrawerClose asChild>
            <button
              type="button"
              aria-label={t("closeMenu")}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
            >
              <HamburgerIcon open={open} />
            </button>
          </DrawerClose>
        </div>

        {/* Scrollable middle: Navigation + Settings */}
        <div className="flex flex-1 flex-col justify-between gap-6 py-4">
          {/* Navigation */}
          <section className="flex flex-col gap-2  px-3">
            <span className={sectionLabel}>{t("menuLabel")}</span>
            <NavLinks variant="drawer" onNavigate={close} />
          </section>

          {/* Settings — label-left + compact pill control on the right.
              Inner `px-3` shifts the rows to line up with the navigation
              items above (which carry their own internal `px-3`). */}
          <section className="flex flex-col gap-3 overflow-y-auto border-t border-border px-3 pt-4">
            <span className={sectionLabel}>{tPref("title")}</span>
            <div className="flex flex-col gap-2 px-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Palette className="size-4 text-muted-foreground" />
                  <span className="font-medium">{tPref("theme")}</span>
                </div>
                <ThemeSwitch />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Globe className="size-4 text-muted-foreground" />
                  <span className="font-medium">{tLang("label")}</span>
                </div>
                <LanguageSwitch />
              </div>
            </div>
          </section>
        </div>

        {/* Footer: identity card + sign out (auth) OR auth CTAs (guest) */}
        <div className="border-t border-border">
          {user ? (
            <div className="flex flex-col">
              <Link href="/profile" onClick={close} className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-primary-foreground text-primary border border-border dark:bg-primary dark:text-primary-foreground">
                    {getInitials(user.username, user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{fullName}</span>
                  <span className="truncate text-xs text-muted-foreground">@{user.username}</span>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
              </Link>
              <div className="h-px bg-border" />
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-destructive transition-colors hover:text-destructive-hover disabled:opacity-50 "
              >
                <div className="flex items-center p-2 bg-destructive/10 rounded-md">
                  <LogOut className="size-4 shrink-0" />
                </div>
                <span className="flex-1 text-left">{loading ? tUser("signingOut") : tUser("signOut")}</span>
              </button>
            </div>
          ) : (
            // Guest invitation card — replaces the profile/sign-out pair an
            // authed user gets. Pitch (subtitle) + sign-in CTA tinted with
            // the route accent + soft sign-up link in the same footprint.
            <div className="flex flex-col gap-3 px-4 py-4">
              <p className="text-center text-xs leading-relaxed text-muted-foreground">{tUser("guestCard.subtitle")}</p>
              <Button asChild className="h-10 w-full bg-page-accent text-white hover:bg-page-accent/90" onClick={close}>
                <Link href="/login">{tUser("guestCard.cta")}</Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {tUser("guestCard.noAccount")}{" "}
                <Link href="/register" onClick={close} className="font-medium text-foreground underline underline-offset-2 hover:text-page-accent-strong">
                  {tUser("guestCard.signupCta")}
                </Link>
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
