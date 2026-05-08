import "server-only";

import { redirect } from "next/navigation";
import { getServerSession, Session } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type AuthResult<T extends boolean> = T extends true
  ? { session: Session; user: NonNullable<Session["user"]> }
  : { session: Session | null; user: Session["user"] | undefined };

async function auth(options: { required: true; redirectTo?: string }): Promise<AuthResult<true>>;
async function auth(options?: { required?: false; redirectTo?: string }): Promise<AuthResult<false>>;
async function auth(options?: { required?: boolean; redirectTo?: string }) {
  const session = await getServerSession(authOptions);

  if (options?.required && !session?.user?.id) {
    redirect(options.redirectTo ?? "/login");
  }

  return { session: session ?? null, user: session?.user };
}

export { auth };
