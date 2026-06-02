import { getCurrentUser } from "@/lib/auth";

import { Brand } from "./Brand";
import { HeaderAuth } from "./HeaderAuth";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { PreferencesToggles } from "./PreferencesToggles";

export async function Header() {
  const user = await getCurrentUser();
  // Plain, serializable shape for the client `HeaderAuth` (it re-syncs from the
  // live session, but needs a server-correct value for the first paint).
  const initialUser = user ? { username: user.username, firstName: user.first_name, lastName: user.last_name } : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* Desktop */}
        <div className="hidden w-full grid-cols-[1fr_auto_1fr] items-center gap-6 lg:grid">
          <Brand className="justify-self-start" />
          <div className="justify-self-center">
            <NavLinks variant="bar" />
          </div>

          <div className="flex items-center gap-2 justify-self-end">
            {/* Theme + language live inline in the bar on desktop (for both
                guests and authed users) instead of inside the profile menu. */}
            <PreferencesToggles />
            <div role="separator" aria-orientation="vertical" className="h-6 w-px bg-border" />
            <HeaderAuth initialUser={initialUser} />
          </div>
        </div>

        {/* Mobile — logo left, burger right. Identity + preferences live in the drawer. */}
        <div className="flex w-full items-center justify-between lg:hidden">
          <Brand />
          <MobileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
