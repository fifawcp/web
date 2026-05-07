import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="flex min-h-[calc(100dvh-var(--header-height))] items-center justify-center">
      {session ? (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Authenticated</p>
          <h1 className="mt-1 text-2xl font-bold">
            {session.user.first_name} {session.user.last_name}
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{session.user.id}</p>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Guest</p>
          <h1 className="mt-1 text-2xl font-bold">Welcome</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to access your dashboard.</p>
        </div>
      )}
    </div>
  );
}
