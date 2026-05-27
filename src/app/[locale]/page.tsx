import { Suspense } from "react";

import { DashboardLoading, DashboardView } from "@/features/dashboard";
import { getDashboard } from "@/features/dashboard/api/dashboard.api";
import { getCurrentUser } from "@/lib/auth";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/shared/components/JsonLd";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: ["en", "es"],
    },
  ],
};

async function DashboardContent() {
  const user = await getCurrentUser();
  const data = await getDashboard(!!user);
  return <DashboardView isLoggedIn={!!user} data={data} currentUserId={user?.id ?? null} />;
}

export default function DashboardPage() {
  return (
    <div data-accent="purple" className="contents">
      <JsonLd data={structuredData} />
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
