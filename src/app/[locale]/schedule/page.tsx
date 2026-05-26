import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MATCHES_CACHE_TAG } from "@/features/schedule/api/matches";
import { ScheduleView } from "@/features/schedule/components/ScheduleView";
import { findAnchorMatchId } from "@/features/schedule/lib/findAnchorMatch";
import type { Match } from "@/features/schedule/types/schedule.types";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";
import { buildPageMetadata } from "@/shared/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.schedule", path: "/schedule" });
}

export default async function SchedulePage() {
  const t = await getTranslations("schedule");
  const user = await getCurrentUser();

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

  return (
    <>
      <h1 className="sr-only">{t("title")}</h1>
      {/* ScheduleView reads filters from the URL via useSearchParams,
          which Next.js requires under a Suspense boundary. */}
      <Suspense>
        <ScheduleView initialMatches={res.data} anchorMatchId={findAnchorMatchId(res.data)} isAuthed={Boolean(user)} />
      </Suspense>
    </>
  );
}
