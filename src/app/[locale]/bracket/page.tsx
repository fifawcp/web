import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BracketView } from "@/features/bracket/components/BracketView";
import { PICKEMS_CACHE_TAG } from "@/features/pickems/api/pickems";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";
import type { Match } from "@/features/schedule/types/schedule.types";
import { getCurrentUser } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/shared/components/JsonLd";
import { serverApi } from "@/shared/lib/api/server";
import { buildBreadcrumbJsonLd } from "@/shared/seo/breadcrumbs";
import { buildPageMetadata } from "@/shared/seo/metadata";

import BracketLoading from "./loading";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.bracket", path: "/bracket" });
}

export default async function BracketPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bracket");

  // Public page — guests welcome. Auth only unlocks the compare view.
  const user = await getCurrentUser();

  // Actual bracket source. Public endpoint; a failure is fatal (no tree, no page).
  const matchesRes = await serverApi.get<Match[]>("/api/matches", {
    authenticated: Boolean(user),
    next: { revalidate: 60, tags: [MATCHES_CACHE_TAG] },
  });
  if (!matchesRes.success || !matchesRes.data) {
    throw new Error(matchesRes.error?.message ?? "Failed to load matches");
  }

  // Predicted bracket for compare. Optional — guests skip it, and a failure just
  // falls back to the results-only view (no compare toggle).
  let pickem: UserPickem | null = null;
  if (user) {
    const pickemRes = await serverApi.get<UserPickem>("/api/pickems", {
      authenticated: true,
      next: { revalidate: 60, tags: [PICKEMS_CACHE_TAG] },
    });
    if (pickemRes.success && pickemRes.data) pickem = pickemRes.data;
  }

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

  // BracketView reads the compare toggle from the URL via useSearchParams, which
  // Next.js requires under a Suspense boundary.
  return (
    <>
      <JsonLd data={bracketLd} />
      <h1 className="sr-only">{t("title")}</h1>
      <Suspense fallback={<BracketLoading />}>
        <BracketView initialMatches={matchesRes.data} initialPickem={pickem} isAuthed={Boolean(user)} userId={user?.id} />
      </Suspense>
    </>
  );
}
