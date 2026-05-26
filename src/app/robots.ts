import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Both unprefixed and /es variants (as-needed serves Spanish under /es).
      disallow: ["/api/", "/pickems", "/boards", "/login", "/register", "/callback", "/es/pickems", "/es/boards", "/es/login", "/es/register", "/es/callback"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
