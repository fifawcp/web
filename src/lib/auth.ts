import "server-only";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get the current session without redirecting.
 * Returns null if no session exists.
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get the current user without redirecting.
 * Returns undefined if no session exists.
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Require authentication - redirects to /login if no session.
 * Returns the session object.
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

/**
 * Get authenticated user - redirects to /login if no session.
 * Returns the user object directly.
 */
export async function getAuthenticatedUser() {
  const session = await requireAuth();
  return session.user;
}
