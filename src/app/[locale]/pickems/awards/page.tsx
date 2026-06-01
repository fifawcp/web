import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { AwardsView } from "@/features/awards/components/AwardsView";
import type { UserAwards } from "@/features/awards/types/awards.types";
import { serverApi } from "@/shared/lib/api/server";

export async function generateMetadata() {
  const t = await getTranslations("awards");
  return { title: `${t("title")} | WCP` };
}

export default async function AwardsPage() {
  const t = await getTranslations("awards");

  // Per-user data whose lock is a time-based transition (kickoff) with no
  // mutation event — caching it would serve a stale `is_locked`, so always
  // read fresh. The client-clock fallback in AwardsView covers an already-open
  // session that crosses kickoff without a reload.
  const res = await serverApi.get<UserAwards>("/api/awards", {
    authenticated: true,
    cache: "no-store",
  });

  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? "Failed to load awards");
  }

  return (
    <>
      <h1 className="sr-only">{t("title")}</h1>
      <Suspense>
        <AwardsView initialData={res.data} />
      </Suspense>
    </>
  );
}
