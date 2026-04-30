"use client";

import { ReactNode } from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  // Disable NextAuth's built-in window-focus refetch -> SessionMonitor already
  // handles re-validation on tab focus via visibilitychange + Web Locks
  return <NextAuthSessionProvider refetchOnWindowFocus={false}>{children}</NextAuthSessionProvider>;
}
