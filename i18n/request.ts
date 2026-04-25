import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  const [authMessages, homeMessages, landingMessages] = await Promise.all([
    import(`./messages/auth/${locale}.json`),
    import(`./messages/home/${locale}.json`),
    import(`./messages/landing/${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      ...authMessages.default,
      ...homeMessages.default,
      ...landingMessages.default,
    },
    timeZone: "UTC",
  };
});
