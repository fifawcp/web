import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  const [authMessages, homeMessages, landingMessages, apiErrorsMessages, scheduleMessages, errorMessages] = await Promise.all([
    import(`./messages/auth/${locale}.json`),
    import(`./messages/home/${locale}.json`),
    import(`./messages/landing/${locale}.json`),
    import(`./messages/api-errors/${locale}.json`),
    import(`./messages/schedule/${locale}.json`),
    import(`./messages/error/${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      auth: authMessages.default,
      ...homeMessages.default,
      ...landingMessages.default,
      apiErrors: apiErrorsMessages.default,
      schedule: scheduleMessages.default,
      error: errorMessages.default,
    },
    timeZone: "UTC",
  };
});
