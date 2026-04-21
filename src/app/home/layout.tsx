"use client";

import { ProtectedRoute } from "@/shared/routes/protected-route";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
