import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

const PUBLIC_PATHS = ["", "/schedule", "/standings", "/bracket", "/faq", "/how-it-works", "/rules", "/privacy", "/terms"];

function sitemapEntry(path: string): MetadataRoute.Sitemap[number] {
  const enUrl = `${SITE_URL}${path || "/"}`;
  const esUrl = `${SITE_URL}/es${path}`;
  return {
    url: enUrl,
    lastModified: new Date("2026-06-09"),
    alternates: { languages: { en: enUrl, es: esUrl, "x-default": enUrl } },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map(sitemapEntry);
}
