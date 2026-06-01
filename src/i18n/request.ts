import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [
    authMessages,
    layoutMessages,
    apiErrorsMessages,
    scheduleMessages,
    pickemsMessages,
    errorMessages,
    dashboardMessages,
    boardsMessages,
    competitionsMessages,
    standingsMessages,
    seoMessages,
    profileMessages,
    awardsMessages,
  ] = await Promise.all([
    import(`./messages/auth/${locale}.json`),
    import(`./messages/layout/${locale}.json`),
    import(`./messages/api-errors/${locale}.json`),
    import(`./messages/schedule/${locale}.json`),
    import(`./messages/pickems/${locale}.json`),
    import(`./messages/error/${locale}.json`),
    import(`./messages/dashboard/${locale}.json`),
    import(`./messages/boards/${locale}.json`),
    import(`./messages/competitions/${locale}.json`),
    import(`./messages/standings/${locale}.json`),
    import(`./messages/seo/${locale}.json`),
    import(`./messages/profile/${locale}.json`),
    import(`./messages/awards/${locale}.json`),
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
      boards: boardsMessages.default,
      competitions: competitionsMessages.default,
      standings: standingsMessages.default,
      seo: seoMessages.default,
      profile: profileMessages.default,
      awards: awardsMessages.default,
    },
    timeZone: "UTC",
  };
});
