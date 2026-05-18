import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  const [authMessages, homeMessages, apiErrorsMessages, scheduleMessages, errorMessages, dashboardMessages] = await Promise.all([
    import(`./messages/auth/${locale}.json`),
    import(`./messages/home/${locale}.json`),
    import(`./messages/api-errors/${locale}.json`),
    import(`./messages/schedule/${locale}.json`),
    import(`./messages/error/${locale}.json`),
    import(`./messages/dashboard/${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      auth: authMessages.default,
      ...homeMessages.default,
      apiErrors: apiErrorsMessages.default,
      schedule: scheduleMessages.default,
      error: errorMessages.default,
      dashboard: dashboardMessages.default,
    },
    timeZone: "UTC",
  };
});
