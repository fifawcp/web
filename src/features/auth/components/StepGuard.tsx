"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "../store/auth.store";

type GuardableField = "identifier" | "otp";

interface StepGuardProps {
  requiredFields: GuardableField[];
  children: React.ReactNode;
  redirectTo?: string;
}

export function StepGuard({ requiredFields, children, redirectTo = "?step=identifier" }: StepGuardProps) {
  const router = useRouter();
  const identifier = useAuthStore((state) => state.identifier);
  const otp = useAuthStore((state) => state.otp);

  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) return;
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  const missing = requiredFields.some((field) => {
    const value = field === "identifier" ? identifier : otp;
    return value.trim().length === 0;
  });

  useEffect(() => {
    if (!hydrated) return;
    if (missing) router.replace(redirectTo);
  }, [hydrated, missing, router, redirectTo]);

  if (!hydrated) return null; // or a tiny skeleton/spinner

  if (missing) return null;
  return <>{children}</>;
}
