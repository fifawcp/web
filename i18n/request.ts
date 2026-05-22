import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  const [authMessages, layoutMessages, apiErrorsMessages, scheduleMessages, pickemsMessages, errorMessages, dashboardMessages, standingsMessages] = await Promise.all([
    import(`./messages/auth/${locale}.json`),
    import(`./messages/layout/${locale}.json`),
    import(`./messages/api-errors/${locale}.json`),
    import(`./messages/schedule/${locale}.json`),
    import(`./messages/pickems/${locale}.json`),
    import(`./messages/error/${locale}.json`),
    import(`./messages/dashboard/${locale}.json`),
    import(`./messages/standings/${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      auth: authMessages.default,
      ...layoutMessages.default,
      apiErrors: apiErrorsMessages.default,
      schedule: scheduleMessages.default,
      pickems: pickemsMessages.default,
      error: errorMessages.default,
      dashboard: dashboardMessages.default,
      standings: standingsMessages.default,
    },
    timeZone: "UTC",
  };
});
