import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Locale-aware navigation — use instead of next/link & next/navigation for internal links.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
