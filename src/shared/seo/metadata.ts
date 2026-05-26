import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const OG_LOCALE: Record<string, string> = { en: "en_US", es: "es_ES" };

// Social-share image. Note: WebP previews are not reliably rendered by Facebook,
// LinkedIn, or WhatsApp (X/Twitter is fine) — revisit if those previews matter.
const OG_IMAGE = { url: "/banner-stadium.webp", width: 1376, height: 768, alt: SITE_NAME };

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
    icons: { icon: "/favicon.svg" },
    robots: { index: true, follow: true },
  };
}
