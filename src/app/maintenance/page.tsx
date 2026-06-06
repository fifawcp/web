import { Wrench } from "lucide-react";
import { cookies, headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { routing, type Locale } from "@/i18n/routing";

export const metadata = { robots: { index: false, follow: false } };

function isLocale(value: string | undefined): value is Locale {
  return value != null && (routing.locales as readonly string[]).includes(value);
}

// No middleware locale negotiation reaches this route, so resolve it ourselves:
// the next-intl cookie first, then Accept-Language, then the default.
async function resolveLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  const preferred = ((await headers()).get("accept-language") ?? "").split(",")[0]?.split("-")[0];
  return isLocale(preferred) ? preferred : routing.defaultLocale;
}

export default async function MaintenancePage() {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "maintenance" });

  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Wrench className="size-7" aria-hidden />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-balance leading-relaxed text-muted-foreground">{t("description")}</p>
        </div>
        <p className="text-sm text-muted-foreground">{t("eta")}</p>
      </div>
    </main>
  );
}
