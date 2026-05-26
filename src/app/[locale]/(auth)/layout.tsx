import { ReactNode } from "react";

// Auth screens read OAuth/step query params at request time (useSearchParams),
// so they can't be statically prerendered for each locale — render on demand.
export const dynamic = "force-dynamic";

export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] relative flex items-center justify-center bg-background px-4 pt-8 pb-[15vh] overflow-hidden">
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
}
