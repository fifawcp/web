import { defineRouting } from "next-intl/routing";

// `as-needed`: the default locale (en) is unprefixed, others get a prefix (/es/...).
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
