"use client";

import { Cog, Laptop } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import { PreferencesContent } from "./PreferencesContent";
import { SessionsContent } from "./SessionsContent";

// Active tab tile picks up the route accent (purple on /profile) — same
// pattern the dashboard's LeaderboardSection uses.
const accentTab = "data-active:text-page-accent-strong data-active:shadow-sm data-active:ring-1 data-active:ring-page-accent/20";

/**
 * Account-management surface — two tabs only: preferences + devices.
 * The previous "Account" tab is gone; its single action (sign out of this
 * device) now lives next to "Sign out everywhere" inside Devices, which
 * is the semantic home for both sign-out flows.
 *
 * Sessions content is lazy-rendered by Radix — the TanStack Query fetch
 * inside `SessionsContent` only fires when the user opens the Devices tab.
 */
export function ManagementTabs() {
  const t = useTranslations("profile.management");

  return (
    <section aria-label={t("title")} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Tabs defaultValue="preferences" className="flex flex-col gap-4">
        <TabsList className="w-full">
          <TabsTrigger value="preferences" className={accentTab}>
            <Cog className="size-3.5" />
            {t("tabPreferences")}
          </TabsTrigger>
          <TabsTrigger value="sessions" className={accentTab}>
            <Laptop className="size-3.5" />
            {t("tabSessions")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="mt-0">
          <PreferencesContent />
        </TabsContent>
        <TabsContent value="sessions" className="mt-0">
          <SessionsContent />
        </TabsContent>
      </Tabs>
    </section>
  );
}
