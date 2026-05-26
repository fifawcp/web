import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Public, crawlable routes only — excludes auth-gated pages and placeholders.
const PUBLIC_PATHS = ["", "/schedule", "/standings", "/how-it-works", "/rules", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    alternates: {
      languages: {
        en: `${SITE_URL}${path || "/"}`,
        es: `${SITE_URL}/es${path}`,
      },
    },
  }));
}
