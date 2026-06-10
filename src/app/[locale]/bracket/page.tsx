import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/shared/components/JsonLd";
import { PlaceholderPage } from "@/shared/components/PlaceholderPage";
import { buildBreadcrumbJsonLd } from "@/shared/seo/breadcrumbs";
import { buildPageMetadata } from "@/shared/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.bracket", path: "/bracket" });
}

export default async function BracketPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  const prefix = locale === "en" ? "" : `/${locale}`;
  const bracketLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildBreadcrumbJsonLd(
        [
          { name: "Pick'ems", url: `${SITE_URL}${prefix}` },
          { name: "Bracket", url: `${SITE_URL}${prefix}/bracket` },
        ],
        locale
      ),
    ],
  };

  return (
    <>
      <JsonLd data={bracketLd} />
      <PlaceholderPage eyebrow={t("comingSoonBadge")} title={t("bracket.title")} body={t("bracket.body")} />
    </>
  );
}
