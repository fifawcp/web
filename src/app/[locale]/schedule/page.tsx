import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";
import { ScheduleView } from "@/features/schedule/components/ScheduleView";
import { buildScheduleJsonLd } from "@/features/schedule/lib/buildScheduleJsonLd";
import { findAnchorMatchId } from "@/features/schedule/lib/findAnchorMatch";
import type { Match } from "@/features/schedule/types/schedule.types";
import { getCurrentUser } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/shared/components/JsonLd";
import { serverApi } from "@/shared/lib/api/server";
import { buildBreadcrumbJsonLd } from "@/shared/seo/breadcrumbs";
import { buildPageMetadata } from "@/shared/seo/metadata";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ match?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.schedule", path: "/schedule" });
}

export default async function SchedulePage({ params, searchParams }: Props) {
  const t = await getTranslations("schedule");
  const [{ locale }, user, { match }] = await Promise.all([params, getCurrentUser(), searchParams]);
  const deepLinkMatchId = match && Number.isFinite(Number(match)) ? Number(match) : null;

  const res = await serverApi.get<Match[]>("/api/matches", {
    authenticated: Boolean(user),
    next: {
      revalidate: 60,
      tags: [MATCHES_CACHE_TAG],
    },
  });

  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? "Failed to load matches");
  }

  const prefix = locale === "en" ? "" : `/${locale}`;
  const eventsData = buildScheduleJsonLd(res.data, locale);
  const breadcrumb = buildBreadcrumbJsonLd(
    [
      { name: "Pick'ems", url: `${SITE_URL}${prefix}` },
      { name: "Schedule", url: `${SITE_URL}${prefix}/schedule` },
    ],
    locale
  );
  const scheduleLd = { "@context": "https://schema.org", "@graph": [...eventsData["@graph"], breadcrumb] };

  return (
    <>
      <h1 className="sr-only">{t("title")}</h1>
      <JsonLd data={scheduleLd} />
      {/* ScheduleView reads filters from the URL via useSearchParams,
          which Next.js requires under a Suspense boundary. */}
      <Suspense>
        <ScheduleView initialMatches={res.data} anchorMatchId={findAnchorMatchId(res.data)} isAuthed={Boolean(user)} deepLinkMatchId={deepLinkMatchId} />
      </Suspense>
    </>
  );
}
