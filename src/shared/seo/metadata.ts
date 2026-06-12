import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const OG_LOCALE: Record<string, string> = { en: "en_US", es: "es_ES" };

// Social-share card image.
const OG_IMAGE = { url: "/og-cover.webp", width: 1200, height: 630, alt: SITE_NAME };

type PageMetaInput = {
  locale: string;
  /** Translation namespace under `seo`, e.g. "seo.rules". */
  namespace: string;
  /** Unprefixed path: "" for home, "/rules", "/schedule"… */
  path: string;
};

export async function buildPageMetadata({ locale, namespace, path }: PageMetaInput): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const title = t("title");
  const description = t("description");

  const enPath = path || "/";
  const esPath = `/es${path}`;
  const canonical = locale === routing.defaultLocale ? enPath : esPath;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { en: enPath, es: esPath, "x-default": enPath },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale] ?? OG_LOCALE.en,
      url: canonical,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

// Root layout metadata; re-exported as the [locale] layout's `generateMetadata`.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const home = await buildPageMetadata({ locale, namespace: "seo.home", path: "" });

  return {
    metadataBase: new URL(SITE_URL),
    ...home,
    title: { default: home.title as string, template: `%s · ${SITE_NAME}` },
    icons: {
      icon: { url: "/favicon.svg", type: "image/svg+xml" },
      apple: "/apple-icon.png",
    },
    verification: { google: "utA0BlfIkcKU42uOX5Em1xAJJDXl2AKcQDuPFE_Wzjo" },
    robots: { index: true, follow: true },
  };
}
