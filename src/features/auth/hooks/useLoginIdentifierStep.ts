"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { requestOtp } from "@/features/auth/api/client";
import {
  loginIdentifierSchema,
  type LoginIdentifierFormData,
} from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useApiError } from "@/shared/hooks/useApiError";

export function useLoginIdentifierStep() {
  const router = useRouter();
  const apiError = useApiError();
  const { setIdentifier } = useAuthStore();

  const form = useForm<LoginIdentifierFormData>({
    resolver: zodResolver(loginIdentifierSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    apiError.clear();

    const res = await requestOtp({ identifier: data.identifier, purpose: "login" });
    if (!res.success) {
      apiError.set(res.error);
      return;
    }

    setIdentifier({ identifier: data.identifier, purpose: "login" });
    router.replace("?step=otp");
  });

  return {
    form,
    apiError,
    onSubmit,
  };
}
