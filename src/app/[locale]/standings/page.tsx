import { Suspense } from "react";
import type { Metadata } from "next";

import { PICKEMS_CACHE_TAG } from "@/features/pickems/api/pickems";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import { STANDINGS_CACHE_TAG } from "@/features/standings/api/standings";
import { StandingsView } from "@/features/standings/components/StandingsView";
import type { StandingRow } from "@/features/standings/types/standings.types";
import { getCurrentUser } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/shared/components/JsonLd";
import { serverApi } from "@/shared/lib/api/server";
import { buildBreadcrumbJsonLd } from "@/shared/seo/breadcrumbs";
import { buildPageMetadata } from "@/shared/seo/metadata";

import StandingsLoading from "./loading";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.standings", path: "/standings" });
}

export default async function StandingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, user] = await Promise.all([params, getCurrentUser()]);

  // Public endpoint — guests welcome. A failure here is fatal: without the
  // table there is no page, so let the error boundary take over.
  const standingsRes = await serverApi.get<StandingRow[]>("/api/standings", {
    authenticated: false,
    next: { revalidate: 60, tags: [STANDINGS_CACHE_TAG] },
  });
  if (!standingsRes.success || !standingsRes.data) {
    throw new Error(standingsRes.error?.message ?? "Failed to load standings");
  }

  // Pickems is optional. A failure must not break the page — the view shows a
  // toast and falls back to the guest (no-comparison) standings. Reuses the
  // `pickems` feature's endpoint, cache tag and `UserPickem` type.
  let pickem: UserPickem | null = null;
  let pickemFailed = false;
  if (user) {
    const picksRes = await serverApi.get<UserPickem>("/api/pickems", {
      authenticated: true,
      next: { revalidate: 60, tags: [PICKEMS_CACHE_TAG] },
    });
    if (picksRes.success && picksRes.data) pickem = picksRes.data;
    else pickemFailed = true;
  }

  const prefix = locale === "en" ? "" : `/${locale}`;
  const breadcrumbLd = buildBreadcrumbJsonLd(
    [
      { name: "Pick'ems", url: `${SITE_URL}${prefix}` },
      { name: "Standings", url: `${SITE_URL}${prefix}/standings` },
    ],
    locale
  );
  const standingsLd = { "@context": "https://schema.org", "@graph": [breadcrumbLd] };

  // StandingsView reads the compare toggle from the URL via useSearchParams,
  // which Next.js requires under a Suspense boundary. The route-level
  // `loading.tsx` covers the *initial* paint; this fallback covers any later
  // client transition that suspends — without it the page would blank out.
  return (
    <>
      <JsonLd data={standingsLd} />
      <Suspense fallback={<StandingsLoading />}>
        <StandingsView initialStandings={standingsRes.data} initialPickem={pickem} pickemFailed={pickemFailed} isAuthed={Boolean(user)} />
      </Suspense>
    </>
  );
}
