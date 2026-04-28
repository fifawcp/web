"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { requestOtp } from "@/features/auth/api/client";
import { registerEmailSchema, type RegisterEmailFormData } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useApiError } from "@/shared/hooks/useApiError";

export function useRegisterEmailStep() {
  const router = useRouter();
  const apiError = useApiError();
  const { setIdentifier } = useAuthStore();

  const form = useForm<RegisterEmailFormData>({
    resolver: zodResolver(registerEmailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    apiError.clear();

    const res = await requestOtp({ identifier: data.email, purpose: "registration" });
    if (!res.success) {
      apiError.set(res.error);
      return;
    }

    setIdentifier({ identifier: data.email, purpose: "registration" });
    router.replace("?step=otp");
  });

  return {
    form,
    apiError,
    onSubmit,
  };
}
