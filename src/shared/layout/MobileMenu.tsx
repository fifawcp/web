"use client";

import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { logoutAndSignOut } from "@/features/auth/lib/logout";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/shared/components/ui/drawer";
import { getInitials } from "@/shared/lib/ui";

import { Brand } from "./Brand";
import { NavLinks } from "./NavLinks";

type SessionUser = {
  username: string;
  first_name: string;
  last_name: string;
};

type MobileMenuProps = {
  isLoggedIn: boolean;
  user?: SessionUser;
};

export function MobileMenu({ isLoggedIn, user }: MobileMenuProps) {
  const t = useTranslations("nav");
  const tUser = useTranslations("userMenu");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Suppress vaul ≤ 1.1.2 bug: releasePointerCapture fires after the pointer is
  // already gone on mobile, throwing a NotFoundError at draggable.tsx:185.
  useEffect(() => {
    const proto = Element.prototype;
    const original = proto.releasePointerCapture;
    proto.releasePointerCapture = function (pointerId: number) {
      try {
        original.call(this, pointerId);
      } catch {
        // Ignore NotFoundError — pointer was already released.
      }
    };
    return () => {
      proto.releasePointerCapture = original;
    };
  }, []);

  const close = () => setOpen(false);

  const handleSignOut = async () => {
    setLoading(true);
    await logoutAndSignOut("/");
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left">
      <DrawerTrigger asChild>
        <button type="button" aria-label={t("openMenu")} className="flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted">
          <Menu className="size-5" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=left]:w-76">
        <DrawerTitle className="sr-only">{t("menuLabel")}</DrawerTitle>
        <DrawerDescription className="sr-only">{t("menuDescription")}</DrawerDescription>

        <div className="relative flex items-center justify-between border-b border-border p-4">
          <Brand onClick={close} />
          <DrawerClose asChild>
            <button
              type="button"
              aria-label={t("closeMenu")}
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </DrawerClose>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <span className="px-3 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("menuLabel")}</span>
          <div className="flex flex-col gap-1">
            <NavLinks variant="drawer" onNavigate={close} />
          </div>
        </div>

        <div className="border-t border-border p-3">
          {isLoggedIn && user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-1">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary-foreground text-primary border border-border dark:bg-primary dark:text-primary-foreground">
                    {getInitials(user.username, user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}</span>
                  <span className="truncate text-xs text-muted-foreground">@{user.username}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} disabled={loading} className="w-full">
                <LogOut className="size-4" />
                {loading ? tUser("signingOut") : tUser("signOut")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" onClick={close}>
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild onClick={close}>
                <Link href="/register">{t("register")}</Link>
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
